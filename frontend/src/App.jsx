import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import Icon from './components/Icon';
import { ToastHost } from './components/Primitives';
import AuthPage    from './pages/AuthPage';
import SearchPage  from './pages/SearchPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import './index.css';

/* ── Toast manager hook ── */
function useToasts() {
  const [toasts, setToasts] = useState([]);
  let _id = 0;
  const push = useCallback((msg, type = 'info') => {
    const id = ++_id;
    setToasts(ts => [...ts, { id, msg, type }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 4500);
  }, []);
  const dismiss = useCallback(id => setToasts(ts => ts.filter(t => t.id !== id)), []);
  return { toasts, push, dismiss };
}

/* ── Top navigation ── */
function NavBar({ user, onSignOut }) {
  const navigate = useNavigate();

  const linkStyle = ({ isActive }) => ({
    display:'inline-flex', alignItems:'center', gap:6,
    padding:'6px 14px', borderRadius:10, fontSize:13, fontWeight:600,
    textDecoration:'none', transition:'all .15s',
    color: isActive ? '#1e40af' : '#64748b',
    background: isActive ? '#eff6ff' : 'transparent',
  });

  return (
    <header style={{ position:'sticky', top:0, zIndex:40, borderBottom:'1px solid rgba(226,232,240,.8)', background:'rgba(255,255,255,.9)', backdropFilter:'blur(12px)' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 16px', display:'flex', alignItems:'center', gap:12, height:56 }}>
        {/* Logo */}
        <button onClick={() => navigate(user?.role === 'pharmacist' ? '/dashboard' : '/search')} style={{ display:'flex', alignItems:'center', gap:10, background:'none', border:'none', cursor:'pointer', marginRight:8 }}>
          <span style={{ display:'grid', placeItems:'center', width:34, height:34, borderRadius:10, background:'#1e40af', boxShadow:'0 6px 14px -4px rgba(30,64,175,.55)', flexShrink:0 }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3.5v8M8 7.5h8" stroke="#fff" strokeWidth="2.6"/>
              <path d="M3.5 18.5c2.8-3.2 5.6-4.8 8.5-4.8s5.7 1.6 8.5 4.8" stroke="#34d399" strokeWidth="2.4"/>
            </svg>
          </span>
          <span style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:18, color:'#0f172a', letterSpacing:'-0.02em' }}>MediSpot</span>
        </button>

        {/* Nav links */}
        {user && (
          <nav style={{ display:'flex', alignItems:'center', gap:4, flex:1 }}>
            {user.role === 'pharmacist' ? (
              <NavLink to="/dashboard" style={linkStyle}>
                <Icon name="store" size={14}/>Dashboard
              </NavLink>
            ) : (
              <NavLink to="/search" style={linkStyle}>
                <Icon name="search" size={14}/>Search
              </NavLink>
            )}
            <NavLink to="/profile" style={linkStyle}>
              <Icon name="mapPin" size={14}/>Location
            </NavLink>
          </nav>
        )}

        {/* Auth area */}
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
          {user ? (
            <div style={{ display:'flex', alignItems:'center', gap:6, borderRadius:12, border:'1px solid #e2e8f0', background:'#fff', padding:'5px 8px 5px 6px', boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
              <span style={{ display:'grid', placeItems:'center', width:28, height:28, borderRadius:8, background: user.role === 'pharmacist' ? '#10b981' : '#1e40af', color:'#fff', fontSize:11, fontWeight:700, flexShrink:0 }}>
                {user.role === 'pharmacist' ? <Icon name="store" size={13}/> : (user.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
              </span>
              <span style={{ fontSize:12, fontWeight:700, color:'#334155', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', paddingRight:4 }}>
                {user.name || user.email}
              </span>
              <button onClick={onSignOut} title="Sign out"
                style={{ display:'grid', placeItems:'center', width:26, height:26, borderRadius:6, border:'none', background:'transparent', cursor:'pointer', color:'#94a3b8', transition:'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background='#fef2f2'; e.currentTarget.style.color='#ef4444'; }}
                onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#94a3b8'; }}>
                <Icon name="power" size={13}/>
              </button>
            </div>
          ) : (
            <NavLink to="/auth" style={{ display:'inline-flex', alignItems:'center', gap:6, borderRadius:11, background:'#1e40af', color:'#fff', padding:'8px 16px', fontSize:13, fontWeight:700, textDecoration:'none', boxShadow:'0 8px 16px -8px rgba(30,64,175,.6)' }}>
              <Icon name="user" size={13}/>Sign In
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}

/* ── Route guard ── */
function Require({ user, role, children }) {
  if (!user) return <Navigate to="/auth" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'pharmacist' ? '/dashboard' : '/search'} replace />;
  return children;
}

/* ── App root ── */
export default function App() {
  const { toasts, push, dismiss } = useToasts();
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ms_user')); } catch { return null; }
  });

  const handleAuth = (u) => setUser(u);

  const signOut = () => {
    localStorage.removeItem('ms_token');
    localStorage.removeItem('ms_user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <NavBar user={user} onSignOut={signOut} />
      <main style={{ flex:1 }}>
        <Routes>
          <Route path="/auth" element={
            user
              ? <Navigate to={user.role === 'pharmacist' ? '/dashboard' : '/search'} replace />
              : <AuthPage onAuth={handleAuth} pushToast={push} />
          }/>
          <Route path="/search" element={
            <Require user={user}>
              <SearchPage user={user} pushToast={push} />
            </Require>
          }/>
          <Route path="/dashboard" element={
            <Require user={user} role="pharmacist">
              <DashboardPage user={user} pushToast={push} />
            </Require>
          }/>
          <Route path="/profile" element={
            <Require user={user}>
              <ProfilePage user={user} setUser={setUser} pushToast={push} />
            </Require>
          }/>
          <Route path="*" element={
            <Navigate to={user ? (user.role === 'pharmacist' ? '/dashboard' : '/search') : '/auth'} replace />
          }/>
        </Routes>
      </main>
      <ToastHost toasts={toasts} dismiss={dismiss} />
    </BrowserRouter>
  );
}
