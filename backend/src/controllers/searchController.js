const Medicine = require('../models/Medicine');
const { queryLLM } = require('../utils/llm');
const { haversineKm } = require('../utils/haversine');

// ---------------------------------------------------------------------------
// POST /api/search
// Body: { query: string, lat?: number, lng?: number }
// ---------------------------------------------------------------------------
const search = async (req, res) => {
  try {
    const { query, lat, lng } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ message: 'query is required' });
    }

    const userLat = typeof lat === 'number' ? lat : null;
    const userLng = typeof lng === 'number' ? lng : null;
    const hasLocation = userLat !== null && userLng !== null;

    // Step 1: Get all distinct medicine names in the DB
    const distinctNames = await Medicine.distinct('name');
    if (!distinctNames.length) {
      return res.json({ results: [] });
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
      return res.json({ results: [] });
    }

    // Step 4: Fetch matching medicines with pharmacist details
    const medicines = await Medicine.find({ name: { $in: matchedNames } })
      .populate('pharmacistId', 'name lat lng phone whatsapp pharmacyId');

    // Step 5: Attach distance if user provided location
    const enriched = medicines.map((med) => {
      const m = med.toObject();
      const pharmacist = m.pharmacistId;

      if (hasLocation && pharmacist?.lat != null && pharmacist?.lng != null) {
        m.distanceKm = haversineKm(userLat, userLng, pharmacist.lat, pharmacist.lng);
      } else {
        m.distanceKm = null;
      }

      return m;
    });

    // Sort: in-stock first, then by distance ascending (nulls last)
    enriched.sort((a, b) => {
      // 1. In-stock pharmacies first
      if (a.inStock !== b.inStock) {
        return a.inStock ? -1 : 1;
      }
      // 2. Distance ascending
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

    // Sort medicine groups: groups with in-stock pharmacies first, then by closest distance
    results.sort((gA, gB) => {
      const hasInStockA = gA.pharmacies.some((p) => p.inStock);
      const hasInStockB = gB.pharmacies.some((p) => p.inStock);
      if (hasInStockA !== hasInStockB) return hasInStockA ? -1 : 1;

      if (hasLocation) {
        const getMinDist = (group) => {
          const inStockPhs = group.pharmacies.filter((p) => p.inStock && p.distanceKm != null);
          const candidates = inStockPhs.length ? inStockPhs : group.pharmacies.filter((p) => p.distanceKm != null);
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

    return res.json({ results });
  } catch (err) {
    console.error('[search]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { search };
