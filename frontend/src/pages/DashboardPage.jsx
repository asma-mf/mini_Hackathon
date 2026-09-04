import { useState, useEffect, useCallback } from 'react';
import Icon from '../components/Icon';
import api from '../api';

const STATUS = {
  in:  { label:'In Stock',     color:'#10b981', bg:'#f0fdf4', border:'#bbf7d0' },
  out: { label:'Out of Stock', color:'#ef4444', bg:'#fef2f2', border:'#fecaca' },
};

/* ── Toggle switch ── */
function Toggle({ checked, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={onChange}
      style={{
        position:'relative', display:'inline-flex', alignItems:'center',
        width:44, height:24, borderRadius:99, border:'none', cursor:'pointer',
        background: checked ? '#1e40af' : '#e2e8f0', transition:'background .2s', flexShrink:0,
      }}>
      <span style={{
        position:'absolute', left: checked ? 22 : 2, width:20, height:20, borderRadius:'50%',
        background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,.2)', transition:'left .2s',
      }} />
    </button>
  );
}

/* ── Medicine row ── */
function MedicineRow({ med, onToggle, onUpdateQty, onUpdatePrice, onDelete }) {
  const st = med.inStock ? STATUS.in : STATUS.out;
  const [delConfirm, setDelConfirm] = useState(false);
  const qty = med.quantity != null ? med.quantity : (med.inStock ? 20 : 0);
  const price = med.price != null ? med.price : 0;

  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 20px', borderBottom:'1px solid #f1f5f9', transition:'background .15s', flexWrap:'wrap' }}
      onMouseEnter={e => e.currentTarget.style.background='#fafbfc'}
      onMouseLeave={e => e.currentTarget.style.background='transparent'}>

      <span style={{ display:'grid', placeItems:'center', width:36, height:36, borderRadius:10, background:'#f1f5f9', color:'#64748b', flexShrink:0 }}>
        <Icon name="pill" size={16} />
      </span>

      <span style={{ flex:'1 1 180px', minWidth:140, fontSize:14, fontWeight:600, color:'#1e293b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
        {med.name}
      </span>

      {/* Price input */}
      <div style={{ display:'inline-flex', alignItems:'center', gap:4, borderRadius:8, background:'#f8fafc', border:'1px solid #e2e8f0', padding:'3px 8px', flexShrink:0 }}
        title="Click to edit unit price (LKR)">
        <span style={{ fontSize:11, fontWeight:700, color:'#64748b' }}>Rs.</span>
        <input
          type="number" min="0" step="any"
          key={price}
          defaultValue={price}
          onBlur={e => {
            const val = Math.max(0, parseFloat(e.target.value) || 0);
            if (val !== price) onUpdatePrice(med._id, val);
          }}
          onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
          style={{ width:60, border:'none', background:'transparent', outline:'none', fontSize:12, fontFamily:'IBM Plex Mono,monospace', fontWeight:700, color:'#0f172a', textAlign:'right' }}
        />
      </div>

      {/* Quantity stepper */}
      <div style={{ display:'inline-flex', alignItems:'center', gap:4, borderRadius:8, background:'#f8fafc', border:'1px solid #e2e8f0', padding:'2px 6px', flexShrink:0 }}>
        <button type="button" onClick={() => onUpdateQty(med._id, Math.max(0, qty - 1))}
          title="Decrease quantity"
          style={{ border:'none', background:'none', cursor:'pointer', padding:'2px 4px', color:'#64748b', fontWeight:700, fontSize:14, lineHeight:1 }}>-</button>
        <span style={{ fontSize:12, fontFamily:'IBM Plex Mono,monospace', fontWeight:700, minWidth:26, textAlign:'center', color: qty > 0 ? '#1e40af' : '#94a3b8' }}>
          {qty}
        </span>
        <button type="button" onClick={() => onUpdateQty(med._id, qty + 1)}
          title="Increase quantity"
          style={{ border:'none', background:'none', cursor:'pointer', padding:'2px 4px', color:'#64748b', fontWeight:700, fontSize:14, lineHeight:1 }}>+</button>
      </div>

      <span style={{ display:'inline-flex', alignItems:'center', gap:5, borderRadius:99, border:`1px solid ${st.border}`, background:st.bg, padding:'3px 10px', fontSize:11, fontWeight:700, color:st.color, whiteSpace:'nowrap', flexShrink:0 }}>
        <span style={{ width:6, height:6, borderRadius:'50%', background:st.color }} />
        {st.label}
      </span>

      <Toggle checked={med.inStock} onChange={() => onToggle(med._id, med.inStock)} />

      {delConfirm ? (
        <div style={{ display:'flex', gap:6, flexShrink:0 }}>
          <button onClick={() => onDelete(med._id)}
            style={{ borderRadius:8, border:'none', background:'#ef4444', color:'#fff', padding:'5px 10px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Confirm</button>
          <button onClick={() => setDelConfirm(false)}
            style={{ borderRadius:8, border:'1px solid #e2e8f0', background:'#fff', color:'#64748b', padding:'5px 10px', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setDelConfirm(true)} aria-label="Delete"
          style={{ display:'grid', placeItems:'center', width:32, height:32, borderRadius:8, border:'none', background:'transparent', color:'#cbd5e1', cursor:'pointer', flexShrink:0, transition:'all .15s' }}
          onMouseEnter={e => { e.currentTarget.style.background='#fef2f2'; e.currentTarget.style.color='#ef4444'; }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#cbd5e1'; }}>
          <Icon name="trash" size={15} />
        </button>
      )}
    </div>
  );
}

/* ── Pharmacist dashboard ── */
export default function DashboardPage({ user, pushToast }) {
  const [medicines, setMedicines] = useState([]);
  const [tab, setTab]         = useState('all');  // all|in|out
  const [sortBy, setSortBy]   = useState('name'); // name|price_asc|price_desc|qty_desc
  const [loading, setLoading] = useState(true);
  const [newName, setNewName]   = useState('');
  const [newQty, setNewQty]     = useState('20');
  const [newPrice, setNewPrice] = useState('150');
  const [adding, setAdding]     = useState(false);

  const load = useCallback(async (status = 'all', sort = 'name') => {
    setLoading(true);
    try {
      const { data } = await api.get(`/medicines/mine?status=${status}&sortBy=${sort}`);
      setMedicines(data.medicines);
    } catch { pushToast('Failed to load medicines', 'error'); }
    finally { setLoading(false); }
  }, [pushToast]);

  useEffect(() => { load(tab, sortBy); }, [tab, sortBy, load]);

  const addMedicine = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const quantity = Math.max(0, parseInt(newQty, 10) || 0);
      const price = Math.max(0, parseFloat(newPrice) || 0);
      await api.post('/medicines', { name: newName.trim(), quantity, price });
      setNewName('');
      setNewQty('20');
      setNewPrice('150');
      load(tab, sortBy);
      pushToast(`"${newName.trim()}" added (Stock: ${quantity}, Rs. ${price.toFixed(2)})!`, 'success');
    } catch (ex) {
      pushToast(ex.response?.data?.message || 'Failed to add', 'error');
    } finally { setAdding(false); }
  };

  const toggleStock = async (id, _currentlyIn) => {
    try {
      const { data } = await api.patch(`/medicines/${id}/stock`);
      setMedicines(ms => ms.map(m => m._id === id ? data.medicine : m));
      pushToast(data.medicine.inStock ? 'Marked as In Stock' : 'Marked as Out of Stock', 'success');
    } catch { pushToast('Failed to update stock', 'error'); }
  };

  const updateQty = async (id, quantity) => {
    try {
      const { data } = await api.patch(`/medicines/${id}/quantity`, { quantity });
      setMedicines(ms => ms.map(m => m._id === id ? data.medicine : m));
    } catch { pushToast('Failed to update quantity', 'error'); }
  };

  const updatePrice = async (id, price) => {
    try {
      const { data } = await api.patch(`/medicines/${id}/price`, { price });
      setMedicines(ms => ms.map(m => m._id === id ? data.medicine : m));
      pushToast(`Price updated: Rs. ${price.toFixed(2)}`, 'success');
    } catch { pushToast('Failed to update price', 'error'); }
  };

  const deleteMedicine = async (id) => {
    try {
      await api.delete(`/medicines/${id}`);
      setMedicines(ms => ms.filter(m => m._id !== id));
      pushToast('Medicine removed', 'info');
    } catch { pushToast('Failed to delete', 'error'); }
  };

  const tabStyle = (t) => ({
    padding:'8px 16px', borderRadius:10, fontSize:12, fontWeight:700, border:'none',
    cursor:'pointer', fontFamily:'inherit', transition:'all .15s',
    background: tab === t ? '#1e40af' : 'transparent',
    color: tab === t ? '#fff' : '#64748b',
  });

  const inCount  = medicines.filter(m => m.inStock).length;
  const outCount = medicines.filter(m => !m.inStock).length;

  return (
    <div style={{ maxWidth:720, margin:'0 auto', padding:'32px 16px 60px' }}>

      {/* Page header */}
      <div className="anim-fadeUp" style={{ marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
          <span style={{ display:'grid', placeItems:'center', width:44, height:44, borderRadius:14, background:'#eff6ff', color:'#1e40af' }}>
            <Icon name="store" size={20} />
          </span>
          <div>
            <h1 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:22, color:'#0f172a', letterSpacing:'-0.02em' }}>
              My Medicine Inventory
            </h1>
            {user?.pharmacyId && (
              <p style={{ fontSize:11, fontFamily:'IBM Plex Mono,monospace', fontWeight:600, color:'#1e40af', marginTop:2 }}>
                {user.pharmacyId}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {[
            { label:'Total', val:medicines.length, color:'#1e40af', bg:'#eff6ff' },
            { label:'In Stock', val:inCount, color:'#059669', bg:'#f0fdf4' },
            { label:'Out of Stock', val:outCount, color:'#dc2626', bg:'#fef2f2' },
          ].map(s => (
            <div key={s.label} style={{ borderRadius:12, border:`1px solid ${s.bg}`, background:s.bg, padding:'10px 16px', display:'flex', flexDirection:'column', gap:2 }}>
              <span style={{ fontSize:20, fontWeight:800, color:s.color, fontFamily:'Sora,sans-serif' }}>{s.val}</span>
              <span style={{ fontSize:11, fontWeight:600, color:s.color, opacity:.75 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add medicine form */}
      <div className="anim-fadeUp" style={{ animationDelay:'60ms', background:'#fff', borderRadius:16, border:'1px solid #e2e8f0', boxShadow:'0 1px 2px rgba(15,23,42,.04), 0 2px 6px -1px rgba(15,23,42,.06)', marginBottom:20 }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:8 }}>
          <Icon name="plus" size={16} style={{ color:'#1e40af' }} />
          <span style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>Add Medicine</span>
        </div>
        <form onSubmit={addMedicine} style={{ padding:'16px 20px', display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
          <input
            value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="Medicine name (e.g. Paracetamol 500mg)"
            style={{ flex:'1 1 200px', minWidth:180, borderRadius:12, border:'1px solid #e2e8f0', background:'#f8fafc', padding:'10px 14px', fontSize:14, fontWeight:500, color:'#1e293b', outline:'none', fontFamily:'inherit' }}
            onFocus={e => { e.target.style.borderColor='#1e40af'; e.target.style.boxShadow='0 0 0 4px rgba(30,64,175,.1)'; e.target.style.background='#fff'; }}
            onBlur={e => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none'; e.target.style.background='#f8fafc'; }}
          />
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:12, fontWeight:600, color:'#64748b' }}>Qty:</span>
            <input
              type="number" min="0" max="9999"
              value={newQty} onChange={e => setNewQty(e.target.value)}
              placeholder="Qty"
              style={{ width:68, borderRadius:12, border:'1px solid #e2e8f0', background:'#f8fafc', padding:'10px 10px', fontSize:14, fontWeight:600, color:'#1e293b', outline:'none', fontFamily:'inherit' }}
              onFocus={e => { e.target.style.borderColor='#1e40af'; e.target.style.boxShadow='0 0 0 4px rgba(30,64,175,.1)'; e.target.style.background='#fff'; }}
              onBlur={e => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none'; e.target.style.background='#f8fafc'; }}
            />
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:12, fontWeight:600, color:'#64748b' }}>Price (Rs):</span>
            <input
              type="number" min="0" step="any"
              value={newPrice} onChange={e => setNewPrice(e.target.value)}
              placeholder="150"
              style={{ width:84, borderRadius:12, border:'1px solid #e2e8f0', background:'#f8fafc', padding:'10px 10px', fontSize:14, fontWeight:600, color:'#1e293b', outline:'none', fontFamily:'inherit' }}
              onFocus={e => { e.target.style.borderColor='#1e40af'; e.target.style.boxShadow='0 0 0 4px rgba(30,64,175,.1)'; e.target.style.background='#fff'; }}
              onBlur={e => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none'; e.target.style.background='#f8fafc'; }}
            />
          </div>
          <button type="submit" disabled={adding || !newName.trim()}
            style={{ display:'inline-flex', alignItems:'center', gap:6, borderRadius:12, border:'none', background:'#1e40af', color:'#fff', padding:'10px 18px', fontSize:13, fontWeight:700, cursor: adding ? 'wait' : 'pointer', fontFamily:'inherit', opacity: adding || !newName.trim() ? .6 : 1, whiteSpace:'nowrap', marginLeft:'auto' }}>
            {adding ? <><Icon name="refresh" size={14} className="spin" />Adding…</> : <><Icon name="plus" size={14} />Add</>}
          </button>
        </form>
      </div>

      {/* Filter tabs & sorting */}
      <div className="anim-fadeUp" style={{ animationDelay:'80ms', background:'#fff', borderRadius:16, border:'1px solid #e2e8f0', boxShadow:'0 1px 2px rgba(15,23,42,.04), 0 2px 6px -1px rgba(15,23,42,.06)', overflow:'hidden' }}>
        {/* Tab bar + Sort dropdown */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, padding:'12px 16px', borderBottom:'1px solid #f1f5f9', flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <button style={tabStyle('all')} onClick={() => setTab('all')}>All ({medicines.length})</button>
            <button style={tabStyle('in')}  onClick={() => setTab('in')}>In Stock ({inCount})</button>
            <button style={tabStyle('out')} onClick={() => setTab('out')}>Out of Stock ({outCount})</button>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:'auto' }}>
            <span style={{ fontSize:12, fontWeight:600, color:'#64748b' }}>Sort:</span>
            <select
              value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{
                borderRadius:10, border:'1px solid #e2e8f0', background:'#f8fafc',
                padding:'6px 10px', fontSize:12, fontWeight:600, color:'#334155',
                outline:'none', cursor:'pointer', fontFamily:'inherit'
              }}>
              <option value="name">Name (A-Z)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="qty_desc">Stock: High to Low</option>
            </select>
          </div>
        </div>

        {/* Medicines list */}
        {loading ? (
          <div style={{ padding:20, display:'flex', flexDirection:'column', gap:12 }}>
            {[0,1,2].map(i => <div key={i} className="shimmer" style={{ height:52, borderRadius:12, background:'#f1f5f9', animationDelay:`${i*80}ms` }} />)}
          </div>
        ) : medicines.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px 24px', color:'#94a3b8' }}>
            <Icon name="pill" size={32} style={{ marginBottom:12, opacity:.35 }} />
            <p style={{ fontSize:14, fontWeight:600 }}>No medicines in this category yet.</p>
            {tab !== 'all' && <p style={{ fontSize:12, marginTop:4 }}>Switch to <button onClick={() => setTab('all')} style={{ background:'none', border:'none', color:'#1e40af', cursor:'pointer', fontWeight:600, fontFamily:'inherit', fontSize:12 }}>All</button> to see everything.</p>}
          </div>
        ) : (
          medicines.map(med => (
            <MedicineRow key={med._id} med={med} onToggle={toggleStock} onUpdateQty={updateQty} onUpdatePrice={updatePrice} onDelete={deleteMedicine} />
          ))
        )}
      </div>
    </div>
  );
}
