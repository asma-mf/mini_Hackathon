const Medicine = require('../models/Medicine');
const { queryLLM } = require('../utils/llm');
const { haversineKm } = require('../utils/haversine');

// ---------------------------------------------------------------------------
// POST /api/search
// Body: { query: string, lat?: number, lng?: number }
// ---------------------------------------------------------------------------
const search = async (req, res) => {
  try {
    const { query, lat, lng, qty, quantity } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ message: 'query is required' });
    }

    const reqQty = Math.max(1, parseInt(quantity || qty, 10) || 1);
    const userLat = typeof lat === 'number' ? lat : null;
    const userLng = typeof lng === 'number' ? lng : null;
    const hasLocation = userLat !== null && userLng !== null;

    // Step 1: Get all distinct medicine names in the DB
    const distinctNames = await Medicine.distinct('name');
    if (!distinctNames.length) {
      return res.json({ results: [], requestedQty: reqQty });
    }

    // Step 2: Ask LLM which names plausibly match the query
    let llmOutput;
    try {
      llmOutput = await queryLLM(distinctNames, query.trim());
      if (!Array.isArray(llmOutput)) throw new Error('LLM did not return an array');
    } catch (err) {
      console.error('[search] LLM parse error:', err.message);
      llmOutput = [];
    }

    // Step 3: Defensive intersection — only keep strings that actually exist in the DB
    const distinctSet = new Set(distinctNames);
    const matchedNames = llmOutput.filter(
      (n) => typeof n === 'string' && distinctSet.has(n)
    );

    if (!matchedNames.length) {
      return res.json({ results: [], requestedQty: reqQty });
    }

    // Step 4: Fetch matching medicines with pharmacist details
    const medicines = await Medicine.find({ name: { $in: matchedNames } })
      .populate('pharmacistId', 'name lat lng phone whatsapp pharmacyId');

    // Step 5: Attach distance & compute stock status relative to requested quantity
    const enriched = medicines.map((med) => {
      const m = med.toObject();
      const pharmacist = m.pharmacistId;

      if (hasLocation && pharmacist?.lat != null && pharmacist?.lng != null) {
        m.distanceKm = haversineKm(userLat, userLng, pharmacist.lat, pharmacist.lng);
      } else {
        m.distanceKm = null;
      }

      // Quantity & stockStatus relative to reqQty
      const availableQty = typeof m.quantity === 'number' ? m.quantity : (m.inStock ? 20 : 0);
      m.quantity = availableQty;

      if (!m.inStock || availableQty <= 0) {
        m.stockStatus = 'out';
      } else if (availableQty >= reqQty) {
        m.stockStatus = 'in'; // In Stock (satisfies requested quantity)
      } else {
        m.stockStatus = 'low'; // Low Stock (available, but fewer than requested)
      }

      return m;
    });

    // Sort: 'in' first, then 'low', then 'out', each by distance ascending
    const statusRank = { in: 0, low: 1, out: 2 };
    enriched.sort((a, b) => {
      const rankA = statusRank[a.stockStatus] ?? 2;
      const rankB = statusRank[b.stockStatus] ?? 2;
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      if (hasLocation) {
        if (a.distanceKm === null && b.distanceKm === null) return 0;
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      }
      return 0;
    });

    // Step 6: Group by medicine name → [{ name, pharmacies[] }]
    const grouped = {};
    for (const med of enriched) {
      if (!grouped[med.name]) grouped[med.name] = [];
      grouped[med.name].push(med);
    }

    const results = Object.entries(grouped).map(([name, pharmacies]) => ({
      name,
      pharmacies,
    }));

    // Sort medicine groups: groups with 'in' pharmacies first, then 'low', then 'out'
    const getGroupRank = (group) => {
      if (group.pharmacies.some((p) => p.stockStatus === 'in')) return 0;
      if (group.pharmacies.some((p) => p.stockStatus === 'low')) return 1;
      return 2;
    };

    results.sort((gA, gB) => {
      const rankA = getGroupRank(gA);
      const rankB = getGroupRank(gB);
      if (rankA !== rankB) return rankA - rankB;

      if (hasLocation) {
        const getMinDist = (group) => {
          const phsWithStock = group.pharmacies.filter((p) => p.stockStatus !== 'out' && p.distanceKm != null);
          const candidates = phsWithStock.length ? phsWithStock : group.pharmacies.filter((p) => p.distanceKm != null);
          if (!candidates.length) return Infinity;
          return Math.min(...candidates.map((p) => p.distanceKm));
        };
        const distA = getMinDist(gA);
        const distB = getMinDist(gB);
        if (distA === Infinity && distB === Infinity) return 0;
        return distA - distB;
      }
      return 0;
    });

    return res.json({ results, requestedQty: reqQty });
  } catch (err) {
    console.error('[search]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { search };
