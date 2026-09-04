import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { LocationPicker } from '../components/Primitives';
import api from '../api';

export default function ProfilePage({ user, setUser, pushToast }) {
  const navigate = useNavigate();
  const [coords, setCoords] = useState({ lat: user?.lat ?? 6.9271, lng: user?.lng ?? 79.8612 });
  const [phone, setPhone]     = useState(user?.phone || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '');
  const [saving, setSaving]   = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const body = { lat: coords.lat, lng: coords.lng };
      if (user?.role === 'pharmacist') { body.phone = phone; body.whatsapp = whatsapp; }
      const { data } = await api.patch('/users/me', body);
      const updated = { ...user, ...data.user };
      localStorage.setItem('ms_user', JSON.stringify(updated));
      setUser(updated);
      pushToast('Profile updated!', 'success');
    } catch (ex) {
      pushToast(ex.response?.data?.message || 'Update failed', 'error');
    } finally { setSaving(false); }
  };

  const inp = {
    width:'100%', borderRadius:12, border:'1px solid #e2e8f0', background:'#f8fafc',
    padding:'10px 14px', fontSize:14, fontWeight:500, color:'#1e293b', outline:'none', fontFamily:'inherit',
  };

  return (
    <div style={{ maxWidth:520, margin:'0 auto', padding:'32px 16px 60px' }}>
      <div className="anim-fadeUp" style={{ marginBottom:24, display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={() => navigate(-1)} style={{ display:'grid', placeItems:'center', width:34, height:34, borderRadius:10, border:'1px solid #e2e8f0', background:'#fff', cursor:'pointer', color:'#64748b' }}>
          <Icon name="chevronDown" size={16} style={{ transform:'rotate(90deg)' }} />
        </button>
        <h1 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:20, color:'#0f172a' }}>Edit Profile</h1>
      </div>

      <div className="anim-fadeUp" style={{ animationDelay:'60ms', background:'#fff', borderRadius:16, border:'1px solid #e2e8f0', overflow:'hidden', boxShadow:'0 1px 2px rgba(15,23,42,.04), 0 2px 6px -1px rgba(15,23,42,.06)' }}>
        {/* User info header */}
        <div style={{ padding:'20px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ display:'grid', placeItems:'center', width:44, height:44, borderRadius:14, background: user?.role === 'pharmacist' ? '#f0fdf4' : '#eff6ff', color: user?.role === 'pharmacist' ? '#059669' : '#1e40af' }}>
            <Icon name={user?.role === 'pharmacist' ? 'building' : 'user'} size={20} />
          </span>
          <div>
            <p style={{ fontWeight:700, color:'#0f172a', fontSize:15 }}>{user?.name || user?.email}</p>
            <p style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>
              {user?.role === 'pharmacist' ? `Pharmacist · ${user?.pharmacyId || ''}` : 'Patient Account'}
            </p>
          </div>
        </div>

        <div style={{ padding:20, display:'flex', flexDirection:'column', gap:16 }}>
          {/* Pharmacist contact fields */}
          {user?.role === 'pharmacist' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#94a3b8', marginBottom:6 }}>Phone</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} style={inp} placeholder="+94 77 123 4567" />
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#94a3b8', marginBottom:6 }}>WhatsApp</label>
                <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} style={inp} placeholder="+94 77 123 4567" />
              </div>
            </div>
          )}

          {/* Map */}
          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#94a3b8', marginBottom:6 }}>
              {user?.role === 'pharmacist' ? 'Pharmacy Location' : 'Your Location'}
            </label>
            <div style={{ height:220, borderRadius:12, overflow:'hidden', border:'1px solid #e2e8f0' }}>
              <LocationPicker initial={coords} onChange={setCoords} pushToast={pushToast} />
            </div>
            <p style={{ fontSize:11, color:'#94a3b8', marginTop:6 }}>Click the map or drag the pin to update your location.</p>
          </div>

          <button onClick={save} disabled={saving}
            style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8, borderRadius:12, border:'none', background:'#1e40af', color:'#fff', padding:'12px 20px', fontSize:14, fontWeight:700, cursor: saving ? 'wait' : 'pointer', fontFamily:'inherit', boxShadow:'0 12px 24px -10px rgba(30,64,175,.6)', opacity: saving ? .7 : 1 }}>
            {saving ? <><Icon name="refresh" size={15} className="spin" />Saving…</> : <><Icon name="check" size={15} />Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}
