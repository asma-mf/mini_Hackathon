import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

/* ── Toast notification host ── */
export function ToastHost({ toasts, dismiss }) {
  const map = {
    success: { icon: 'checkCheck', color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
    error:   { icon: 'alert',      color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
    info:    { icon: 'info',       color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe' },
  };
  return (
    <div style={{ position:'fixed', zIndex:90, bottom:16, right:20, display:'flex', flexDirection:'column', gap:10, pointerEvents:'none' }}>
      {toasts.map(t => {
        const st = map[t.type] || map.info;
        return (
          <div key={t.id} className="anim-toastIn" style={{
            pointerEvents:'auto', position:'relative', overflow:'hidden',
            display:'flex', alignItems:'flex-start', gap:12,
            borderRadius:14, border:`1px solid ${st.border}`, background:'#fff',
            padding:'12px 36px 12px 14px', boxShadow:'0 24px 64px -16px rgba(15,23,42,.25)',
            maxWidth:380, width:'100%',
          }}>
            <span style={{ display:'grid', placeItems:'center', width:28, height:28, borderRadius:8, background:st.bg, border:`1px solid ${st.border}`, color:st.color, flexShrink:0 }}>
              <Icon name={st.icon} size={14} />
            </span>
            <p style={{ fontSize:13, lineHeight:1.45, color:'#334155', fontWeight:500 }}>{t.msg}</p>
            <button onClick={() => dismiss(t.id)} style={{ position:'absolute', right:8, top:10, background:'none', border:'none', cursor:'pointer', color:'#cbd5e1' }}>
              <Icon name="x" size={14} />
            </button>
            <span style={{ position:'absolute', bottom:0, left:0, height:3, background:st.color, animation:'barShrink 4.2s linear forwards' }} />
          </div>
        );
      })}
    </div>
  );
}

/* ── Field wrapper with label + error ── */
export function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} style={{ display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#94a3b8', marginBottom:6 }}>
        {label}
      </label>
      {children}
      {error
        ? <p style={{ marginTop:6, display:'flex', alignItems:'center', gap:4, fontSize:11, fontWeight:600, color:'#ef4444' }}>
            <Icon name="alert" size={11} />{error}
          </p>
        : hint
          ? <p style={{ marginTop:6, fontSize:11, color:'#94a3b8', lineHeight:1.5 }}>{hint}</p>
          : null}
    </div>
  );
}

/* ── Text input ── */
export function TextInput({ id, icon, error, style, ...props }) {
  const base = {
    width:'100%', borderRadius:12, border: error ? '1px solid #fca5a5' : '1px solid #e2e8f0',
    background: error ? '#fef2f2' : '#f8fafc', padding: icon ? '10px 14px 10px 40px' : '10px 14px',
    fontSize:14, fontWeight:500, color: error ? '#b91c1c' : '#1e293b', outline:'none',
    transition:'border-color .15s, box-shadow .15s', fontFamily:'inherit',
  };
  return (
    <div style={{ position:'relative' }}>
      {icon && <Icon name={icon} size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', pointerEvents:'none' }} />}
      <input id={id} {...props} style={{ ...base, ...style }}
        onFocus={e => { e.target.style.border='1px solid #1e40af'; e.target.style.boxShadow='0 0 0 4px rgba(30,64,175,.1)'; e.target.style.background='#fff'; }}
        onBlur={e => { e.target.style.border = error ? '1px solid #fca5a5' : '1px solid #e2e8f0'; e.target.style.boxShadow='none'; e.target.style.background= error ? '#fef2f2' : '#f8fafc'; }}
      />
    </div>
  );
}

/* ── Password input with show/hide toggle ── */
export function PasswordInput({ id, value, onChange, onBlur, error, placeholder }) {
  const [show, setShow] = useState(false);
  const base = {
    width:'100%', borderRadius:12, border: error ? '1px solid #fca5a5' : '1px solid #e2e8f0',
    background: error ? '#fef2f2' : '#f8fafc', padding:'10px 40px 10px 40px',
    fontSize:14, fontWeight:500, color: error ? '#b91c1c' : '#1e293b', outline:'none',
    transition:'border-color .15s, box-shadow .15s', fontFamily:'inherit',
  };
  return (
    <div style={{ position:'relative' }}>
      <Icon name="lock" size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', pointerEvents:'none' }} />
      <input id={id} type={show ? 'text' : 'password'} value={value} onChange={onChange} onBlur={onBlur}
        placeholder={placeholder} autoComplete="new-password" style={base}
        onFocus={e => { e.target.style.border='1px solid #1e40af'; e.target.style.boxShadow='0 0 0 4px rgba(30,64,175,.1)'; e.target.style.background='#fff'; }}
        onBlurCapture={e => { e.target.style.border = error ? '1px solid #fca5a5' : '1px solid #e2e8f0'; e.target.style.boxShadow='none'; }}
      />
      <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide' : 'Show'}
        style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8', display:'grid', placeItems:'center', width:28, height:28, borderRadius:8 }}>
        <Icon name={show ? 'eyeOff' : 'eye'} size={15} />
      </button>
    </div>
  );
}

/* ── Skeleton loading card ── */
export function SkeletonCard({ i = 0 }) {
  return (
    <div className="anim-fadeUp" style={{ background:'#fff', borderRadius:16, border:'1px solid #e2e8f0', padding:20, animationDelay:`${i * 90}ms` }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div className="shimmer" style={{ width:40, height:40, borderRadius:12, background:'#f1f5f9' }} />
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
          <div className="shimmer" style={{ height:14, width:'50%', borderRadius:6, background:'#f1f5f9' }} />
          <div className="shimmer" style={{ height:11, width:'35%', borderRadius:6, background:'#f1f5f9' }} />
        </div>
        <div className="shimmer" style={{ height:24, width:100, borderRadius:99, background:'#f1f5f9' }} />
      </div>
      <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:8 }}>
        <div className="shimmer" style={{ height:11, width:'65%', borderRadius:6, background:'#f1f5f9' }} />
        <div className="shimmer" style={{ height:11, width:'48%', borderRadius:6, background:'#f1f5f9' }} />
      </div>
      <div className="shimmer" style={{ marginTop:16, height:36, width:'100%', borderRadius:12, background:'#f1f5f9' }} />
    </div>
  );
}

/* ── Location Picker (Leaflet) ── */
export function LocationPicker({ initial, onChange, pushToast }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const mkRef = useRef(null);
  const [pos, setPos] = useState(initial || { lat: 6.9271, lng: 79.8612 });

  useEffect(() => {
    if (mapRef.current) return;
    // Dynamic leaflet import to avoid SSR issues
    import('leaflet').then(L => {
      const map = L.map(elRef.current, { zoomControl: false, attributionControl: false, scrollWheelZoom: false })
        .setView([pos.lat, pos.lng], 13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const icon = L.divIcon({ className: 'ms-pin', html: '<span style="--c:#1e40af"></span>', iconSize: [22, 22], iconAnchor: [11, 11] });
      const mk = L.marker([pos.lat, pos.lng], { draggable: true, icon }).addTo(map);

      const commit = (latlng) => {
        const v = { lat: +latlng.lat.toFixed(5), lng: +latlng.lng.toFixed(5) };
        setPos(v); onChange?.(v);
      };
      mk.on('dragend', () => commit(mk.getLatLng()));
      map.on('click', e => { mk.setLatLng(e.latlng); commit(e.latlng); });

      mapRef.current = map; mkRef.current = mk;
      setTimeout(() => map.invalidateSize(), 80);
      setTimeout(() => map.invalidateSize(), 350);
    });
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  const locate = () => {
    if (!navigator.geolocation) { pushToast?.('Geolocation unavailable', 'info'); return; }
    navigator.geolocation.getCurrentPosition(p => {
      import('leaflet').then(() => {
        const v = { lat: +p.coords.latitude.toFixed(5), lng: +p.coords.longitude.toFixed(5) };
        mapRef.current?.setView([v.lat, v.lng], 15);
        mkRef.current?.setLatLng([v.lat, v.lng]);
        setPos(v); onChange?.(v);
        pushToast?.('Location pinned!', 'success');
      });
    }, () => pushToast?.('Location denied — drag the pin manually.', 'error'), { timeout: 6000 });
  };

  return (
    <div style={{ position:'relative', height:'100%' }}>
      <div ref={elRef} style={{ width:'100%', height:'100%' }} />
      <div style={{ position:'absolute', top:8, left:8, zIndex:500, pointerEvents:'none', borderRadius:8, border:'1px solid #e2e8f0', background:'rgba(255,255,255,.9)', backdropFilter:'blur(4px)', padding:'4px 10px', fontSize:10, fontFamily:'IBM Plex Mono, monospace', fontWeight:600, color:'#475569', boxShadow:'0 2px 6px rgba(0,0,0,.08)' }}>
        {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
      </div>
      <button type="button" onClick={locate}
        style={{ position:'absolute', bottom:8, right:8, zIndex:500, display:'inline-flex', alignItems:'center', gap:6, borderRadius:8, border:'1px solid #e2e8f0', background:'rgba(255,255,255,.95)', padding:'6px 10px', fontSize:11, fontWeight:600, color:'#475569', cursor:'pointer', boxShadow:'0 2px 6px rgba(0,0,0,.08)' }}>
        <Icon name="locate" size={12} />Use my location
      </button>
    </div>
  );
}
