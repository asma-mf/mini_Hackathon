import { useState, useEffect, useCallback, useRef } from 'react';
import Icon from '../components/Icon';
import { SkeletonCard } from '../components/Primitives';
import api from '../api';

const STATUS = {
  in:  { label:'In Stock',     color:'#10b981', bg:'#f0fdf4', border:'#bbf7d0', dot:'#10b981' },
  out: { label:'Out of Stock', color:'#ef4444', bg:'#fef2f2', border:'#fecaca', dot:'#ef4444' },
};

function digitsOnly(v) { return (v || '').replace(/\D/g, ''); }

/* ── Pharmacy result card ── */
function PharmacyRow({ med, pharmacy, i }) {
  const ph = pharmacy.pharmacistId || {};
  const inStock = pharmacy.inStock;
  const st = inStock ? STATUS.in : STATUS.out;

  return (
    <article className="anim-fadeUp" style={{
      background:'#fff', borderRadius:16, border:'1px solid #e2e8f0',
      padding:'16px 20px', boxShadow:'0 1px 2px rgba(15,23,42,.04), 0 2px 6px -1px rgba(15,23,42,.06)',
      transition:'box-shadow .2s, transform .2s', cursor:'default',
      animationDelay:`${Math.min(i * 70, 500)}ms`,
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow='0 14px 28px -10px rgba(30,64,175,.16), 0 4px 10px -4px rgba(15,23,42,.08)'; e.currentTarget.style.transform='translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow='0 1px 2px rgba(15,23,42,.04), 0 2px 6px -1px rgba(15,23,42,.06)'; e.currentTarget.style.transform='translateY(0)'; }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
          <span style={{ display:'grid', placeItems:'center', width:40, height:40, borderRadius:12, background:'#f1f5f9', color:'#64748b', flexShrink:0 }}>
            <Icon name="store" size={18} />
          </span>
          <div style={{ minWidth:0 }}>
            <h3 style={{ fontFamily:'Sora,sans-serif', fontWeight:600, fontSize:15, color:'#0f172a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {ph.name || 'Unknown Pharmacy'}
            </h3>
            <p style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>
              {ph.pharmacyId && <span style={{ fontFamily:'IBM Plex Mono,monospace', fontWeight:600, color:'#1e40af', marginRight:6 }}>{ph.pharmacyId}</span>}
            </p>
          </div>
        </div>

        {/* Status pill */}
        <span style={{ display:'inline-flex', alignItems:'center', gap:6, flexShrink:0, borderRadius:99, border:`1px solid ${st.border}`, background:st.bg, padding:'5px 12px', fontSize:11, fontWeight:700, color:st.color, whiteSpace:'nowrap' }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background:st.dot, ...(inStock ? { animation:'livePulse 2s ease-out infinite' } : {}) }} />
          {st.label}
        </span>
      </div>

      {/* Meta row */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:'6px 16px', marginTop:12, fontSize:13, color:'#64748b' }}>
        {pharmacy.distanceKm != null && (
          <span style={{ display:'flex', alignItems:'center', gap:5 }}>
            <Icon name="navigation" size={13} style={{ color:'#94a3b8' }} />
            <span style={{ fontFamily:'IBM Plex Mono,monospace', fontWeight:600, color:'#334155' }}>{pharmacy.distanceKm} km</span>
          </span>
        )}
        {ph.phone && (
          <span style={{ display:'flex', alignItems:'center', gap:5 }}>
            <Icon name="phone" size={13} style={{ color:'#94a3b8' }} />
            {ph.phone}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:14, paddingTop:14, borderTop:'1px solid #f1f5f9' }}>
        {ph.phone && (
          <a href={`tel:${ph.phone}`}
            style={{ display:'inline-flex', alignItems:'center', gap:6, borderRadius:10, border:'1px solid #e2e8f0', background:'#f8fafc', padding:'7px 14px', fontSize:12, fontWeight:600, color:'#334155', textDecoration:'none', transition:'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#1e40af'; e.currentTarget.style.color='#1e40af'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.color='#334155'; }}>
            <Icon name="phone" size={13} />Call
          </a>
        )}
        {ph.whatsapp && digitsOnly(ph.whatsapp) && (
          <a href={`https://wa.me/${digitsOnly(ph.whatsapp)}`} target="_blank" rel="noreferrer"
            style={{ display:'inline-flex', alignItems:'center', gap:6, borderRadius:10, border:'1px solid #bbf7d0', background:'#f0fdf4', padding:'7px 14px', fontSize:12, fontWeight:600, color:'#059669', textDecoration:'none', transition:'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background='#10b981'; e.currentTarget.style.color='#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background='#f0fdf4'; e.currentTarget.style.color='#059669'; }}>
            <Icon name="whatsapp" size={13} />WhatsApp
          </a>
        )}
        {!inStock && (
          <span style={{ display:'inline-flex', alignItems:'center', gap:6, borderRadius:10, border:'1px solid #fecaca', background:'#fef2f2', padding:'7px 14px', fontSize:12, fontWeight:600, color:'#dc2626' }}>
            <Icon name="alert" size={13} />Currently unavailable
          </span>
        )}
      </div>
    </article>
  );
}

/* ── Search page ── */
export default function SearchPage({ user, pushToast }) {
  const [query, setQuery]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [results, setResults]   = useState(null);   // [{ name, pharmacies[] }]
  const [radius, setRadius]     = useState('all');  // '1'|'5'|'10'|'25'|'all'
  const [userCoords, setUserCoords] = useState(null);
  const debounceRef = useRef(null);

  // Request geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {} // silently ignore denial
    );
  }, []);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    try {
      const body = { query: q };
      if (userCoords) { body.lat = userCoords.lat; body.lng = userCoords.lng; }
      const { data } = await api.post('/search', body);
      setResults(data.results);
    } catch (ex) {
      pushToast(ex.response?.data?.message || 'Search failed', 'error');
    } finally {
      setLoading(false);
    }
  }, [userCoords, pushToast]);

  // Debounced search — 350ms
  const handleInput = (e) => {
    const v = e.target.value;
    setQuery(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(v), 350);
  };

  // Client-side radius filter
  const filtered = results?.map(group => ({
    ...group,
    pharmacies: group.pharmacies.filter(ph => {
      if (radius === 'all' || ph.distanceKm == null) return true;
      return ph.distanceKm <= Number(radius);
    }),
  })).filter(g => g.pharmacies.length > 0);

  const total = filtered?.reduce((s, g) => s + g.pharmacies.length, 0) ?? 0;

  return (
    <div style={{ maxWidth:880, margin:'0 auto', padding:'32px 16px 60px' }}>

      {/* Page header */}
      <div className="anim-fadeUp" style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:28, color:'#0f172a', letterSpacing:'-0.02em' }}>
          Find a Medicine
        </h1>
        <p style={{ fontSize:14, color:'#94a3b8', marginTop:4, fontWeight:500 }}>
          Search by name, brand, or generic — AI handles typos and alternatives.
          {userCoords
            ? <span style={{ color:'#10b981' }}> · Location detected ✓</span>
            : <span style={{ color:'#94a3b8' }}> · Enable location for distance sorting.</span>}
        </p>
      </div>

      {/* Search bar */}
      <div className="anim-fadeUp" style={{ animationDelay:'60ms', marginBottom:20 }}>
        <div style={{ position:'relative' }}>
          <Icon name="search" size={18} style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', pointerEvents:'none' }} />
          <input
            id="ms-search-input"
            value={query} onChange={handleInput}
            placeholder='Try "Paracetamol", "Ventolin", or "amox 250"…'
            style={{
              width:'100%', borderRadius:16, border:'1px solid #e2e8f0', background:'#fff',
              padding:'14px 48px 14px 48px', fontSize:15, fontWeight:500, color:'#1e293b',
              outline:'none', boxShadow:'0 1px 2px rgba(15,23,42,.04)', fontFamily:'inherit',
              transition:'border-color .15s, box-shadow .15s',
            }}
            onFocus={e => { e.target.style.borderColor='#1e40af'; e.target.style.boxShadow='0 0 0 4px rgba(30,64,175,.1)'; }}
            onBlur={e => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none'; }}
          />
          {loading && (
            <span style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', color:'#1e40af' }}>
              <Icon name="refresh" size={16} className="spin" />
            </span>
          )}
          {!loading && query && (
            <button onClick={() => { setQuery(''); setResults(null); }}
              style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#cbd5e1' }}>
              <Icon name="x" size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Radius filter (only if location available) */}
      {userCoords && results && (
        <div className="anim-fadeUp" style={{ animationDelay:'80ms', display:'flex', alignItems:'center', gap:8, marginBottom:20, flexWrap:'wrap' }}>
          <Icon name="sliders" size={14} style={{ color:'#94a3b8' }} />
          <span style={{ fontSize:12, fontWeight:600, color:'#64748b' }}>Radius:</span>
          {[['1','1 km'],['5','5 km'],['10','10 km'],['25','25 km'],['all','All']].map(([val, label]) => (
            <button key={val} onClick={() => setRadius(val)}
              style={{ borderRadius:99, border: radius === val ? '1px solid #1e40af' : '1px solid #e2e8f0', background: radius === val ? '#1e40af' : '#fff', color: radius === val ? '#fff' : '#64748b', padding:'4px 12px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {[0,1,2].map(i => <SkeletonCard key={i} i={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && results && filtered?.length === 0 && (
        <div className="anim-fadeUp" style={{ textAlign:'center', padding:'60px 24px', borderRadius:16, border:'1px dashed #cbd5e1', background:'rgba(255,255,255,.6)' }}>
          <span style={{ display:'inline-grid', placeItems:'center', width:48, height:48, borderRadius:14, background:'#f1f5f9', color:'#94a3b8', marginBottom:12 }}>
            <Icon name="mapPinOff" size={22} />
          </span>
          <h3 style={{ fontFamily:'Sora,sans-serif', fontWeight:700, color:'#334155', fontSize:16 }}>No results found</h3>
          <p style={{ fontSize:13, color:'#94a3b8', marginTop:6 }}>
            {radius !== 'all' ? 'Try a wider radius or ' : ''}Try a different name or spelling.
          </p>
        </div>
      )}

      {/* No search yet */}
      {!loading && !results && !query && (
        <div className="anim-fadeUp" style={{ textAlign:'center', padding:'80px 24px', color:'#94a3b8' }}>
          <Icon name="pill" size={40} style={{ marginBottom:12, opacity:.35 }} className="bounce" />
          <p style={{ fontSize:14, fontWeight:500 }}>Start typing to search medicines across all pharmacies.</p>
        </div>
      )}

      {/* Results */}
      {!loading && filtered && filtered.length > 0 && (
        <>
          <p className="anim-fadeUp" style={{ fontSize:13, color:'#64748b', fontWeight:500, marginBottom:16 }}>
            Found <span style={{ color:'#1e40af', fontWeight:700 }}>{total} pharmacies</span> carrying matching medicines
          </p>
          {filtered.map(group => (
            <div key={group.name} style={{ marginBottom:32 }}>
              {/* Medicine name header */}
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <span style={{ display:'grid', placeItems:'center', width:32, height:32, borderRadius:10, background:'#eff6ff', color:'#1e40af' }}>
                  <Icon name="pill" size={15} />
                </span>
                <h2 style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:16, color:'#0f172a' }}>
                  {group.name}
                  <span style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:11, fontWeight:600, color:'#94a3b8', marginLeft:8 }}>
                    {group.pharmacies.length} {group.pharmacies.length === 1 ? 'pharmacy' : 'pharmacies'}
                  </span>
                </h2>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {group.pharmacies.map((ph, i) => (
                  <PharmacyRow key={ph._id} med={group.name} pharmacy={ph} i={i} />
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
