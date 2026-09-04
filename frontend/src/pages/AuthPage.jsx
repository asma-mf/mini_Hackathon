import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { Field, TextInput, PasswordInput, LocationPicker } from '../components/Primitives';
import api from '../api';

const btn = (primary = true) => ({
  display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
  borderRadius:12, padding:'12px 20px', fontSize:14, fontWeight:700, cursor:'pointer',
  border:'none', width:'100%', fontFamily:'inherit', transition:'all .15s',
  ...(primary
    ? { background:'#1e40af', color:'#fff', boxShadow:'0 12px 24px -10px rgba(30,64,175,.6)' }
    : { background:'#f1f5f9', color:'#475569' }),
});

/* ── Segmented control helper ── */
const Seg = ({ options, value, onChange }) => (
  <div style={{ position:'relative', display:'grid', gridTemplateColumns:`repeat(${options.length},1fr)`, borderRadius:12, border:'1px solid #e2e8f0', background:'#f1f5f9', padding:4 }}>
    <span aria-hidden="true" style={{
      position:'absolute', inset:4, width:`calc(${100/options.length}% - ${options.length === 2 ? 4 : 2}px)`,
      borderRadius:9, background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,.1)',
      transition:'transform .25s ease', transform:`translateX(${options.findIndex(o=>o.id===value) * 100}%)`,
    }}/>
    {options.map(o => (
      <button key={o.id} type="button" onClick={() => onChange(o.id)}
        style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, borderRadius:9, padding:'8px 6px', fontSize:13, fontWeight:600, border:'none', background:'transparent', cursor:'pointer', fontFamily:'inherit', color: value === o.id ? '#1e40af' : '#64748b', transition:'color .2s' }}>
        <Icon name={o.icon} size={14}/>{o.label}
      </button>
    ))}
  </div>
);

export default function AuthPage({ onAuth }) {
  const navigate = useNavigate();
  const [role, setRole]   = useState('user');          // 'user' | 'pharmacist'
  const [mode, setMode]   = useState('login');          // 'login' | 'register'
  const [busy, setBusy]   = useState(false);
  const [err,  setErr]    = useState('');
  const [coords, setCoords] = useState({ lat: 6.9271, lng: 79.8612 });

  const [form, setForm] = useState({
    email: '', password: '', name: '', phone: '', whatsapp: '',
  });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const body = mode === 'login'
        ? { email: form.email, password: form.password }
        : {
            email: form.email, password: form.password,
            role, name: form.name,
            lat: coords.lat, lng: coords.lng,
            ...(role === 'pharmacist' ? { phone: form.phone, whatsapp: form.whatsapp } : {}),
          };
      const { data } = await api.post(endpoint, body);
      localStorage.setItem('ms_token', data.token);
      localStorage.setItem('ms_user',  JSON.stringify(data.user));
      onAuth(data.user);
      navigate(data.user.role === 'pharmacist' ? '/dashboard' : '/search');
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };



  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', padding:16 }} className="hero-dots">
      <div style={{ width:'100%', maxWidth: role === 'pharmacist' && mode === 'register' ? 520 : 420 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <span style={{ display:'grid', placeItems:'center', width:44, height:44, borderRadius:14, background:'#1e40af', boxShadow:'0 8px 18px -6px rgba(30,64,175,.55)' }}>
              <svg width={26} height={26} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3.5v8M8 7.5h8" stroke="#fff" strokeWidth="2.6"/>
                <path d="M3.5 18.5c2.8-3.2 5.6-4.8 8.5-4.8s5.7 1.6 8.5 4.8" stroke="#34d399" strokeWidth="2.4"/>
              </svg>
            </span>
            <span style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:22, color:'#0f172a', letterSpacing:'-0.02em' }}>MediSpot</span>
          </div>
          <p style={{ fontSize:13, color:'#94a3b8', fontWeight:500 }}>Find medicines near you, in stock, right now.</p>
        </div>

        {/* Card */}
        <div className="anim-modalIn" style={{ background:'#fff', borderRadius:20, boxShadow:'0 24px 64px -16px rgba(15,23,42,.18)', border:'1px solid #e2e8f0', overflow:'hidden' }}>
          {/* Mode tabs */}
          <div style={{ padding:'20px 20px 0', borderBottom:'1px solid #f1f5f9' }}>
            <Seg
              options={[{ id:'login', label:'Sign In', icon:'lock' }, { id:'register', label:'Register', icon:'user' }]}
              value={mode} onChange={m => { setMode(m); setErr(''); }}
            />
            {mode === 'register' && (
              <div style={{ marginTop:12, marginBottom:4 }}>
                <Seg
                  options={[{ id:'user', label:'Patient', icon:'user' }, { id:'pharmacist', label:'Pharmacist', icon:'building' }]}
                  value={role} onChange={r => { setRole(r); setErr(''); }}
                />
              </div>
            )}
          </div>

          <form onSubmit={submit} style={{ padding:20, display:'flex', flexDirection:'column', gap:16 }}>
            {/* Name (register only) */}
            {mode === 'register' && (
              <Field label="Full Name" htmlFor="ms-name">
                <TextInput id="ms-name" icon="user" type="text" value={form.name} onChange={set('name')} placeholder="e.g. Nimal Perera" required />
              </Field>
            )}

            <Field label="Email" htmlFor="ms-email">
              <TextInput id="ms-email" icon="mail" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
            </Field>

            <Field label="Password" htmlFor="ms-pw">
              <PasswordInput id="ms-pw" value={form.password} onChange={set('password')} placeholder={mode === 'login' ? 'Your password' : 'Min 6 characters'} />
            </Field>

            {/* Pharmacist-only fields */}
            {mode === 'register' && role === 'pharmacist' && (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <Field label="Phone" htmlFor="ms-phone">
                    <TextInput id="ms-phone" icon="phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="+94 77 123 4567" required />
                  </Field>
                  <Field label="WhatsApp" htmlFor="ms-wa">
                    <TextInput id="ms-wa" icon="whatsapp" type="tel" value={form.whatsapp} onChange={set('whatsapp')} placeholder="+94 77 123 4567" required />
                  </Field>
                </div>
                <Field label="Pharmacy Location" hint="Click the map or drag the pin to your pharmacy.">
                  <div style={{ height:200, borderRadius:12, overflow:'hidden', border:'1px solid #e2e8f0', marginTop:4 }}>
                    <LocationPicker initial={coords} onChange={setCoords} />
                  </div>
                </Field>
              </>
            )}

            {/* Location for regular users (register) */}
            {mode === 'register' && role === 'user' && (
              <Field label="Your Location (optional)" hint="Helps sort results by distance. Click the map to set.">
                <div style={{ height:160, borderRadius:12, overflow:'hidden', border:'1px solid #e2e8f0', marginTop:4 }}>
                  <LocationPicker initial={coords} onChange={setCoords} />
                </div>
              </Field>
            )}

            {err && (
              <div style={{ display:'flex', alignItems:'center', gap:8, borderRadius:10, border:'1px solid #fecaca', background:'#fef2f2', padding:'10px 14px', fontSize:13, color:'#dc2626', fontWeight:500 }}>
                <Icon name="alert" size={14} />{err}
              </div>
            )}

            <button type="submit" disabled={busy} style={{ ...btn(), opacity: busy ? .65 : 1 }}>
              {busy
                ? <><Icon name="refresh" size={15} className="spin" />Processing…</>
                : mode === 'login' ? <><Icon name="lock" size={15} />Sign In</> : <><Icon name="user" size={15} />Create Account</>}
            </button>

            <p style={{ textAlign:'center', fontSize:12, color:'#94a3b8' }}>
              {mode === 'login'
                ? <>No account? <button type="button" onClick={() => setMode('register')} style={{ background:'none', border:'none', color:'#1e40af', fontWeight:600, cursor:'pointer', fontFamily:'inherit', fontSize:12 }}>Register here</button></>
                : <>Already registered? <button type="button" onClick={() => setMode('login')} style={{ background:'none', border:'none', color:'#1e40af', fontWeight:600, cursor:'pointer', fontFamily:'inherit', fontSize:12 }}>Sign in</button></>}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
