import React, { useState, useEffect } from 'react';
import { ShieldCheck, LayoutDashboard, Search, List, Users, MessageSquare, FileText, Activity, Zap, Rocket, TrendingUp, Package, CheckCircle2, AlertTriangle } from 'lucide-react';

const API_BASE = "https://weaveos-backend.vercel.app";

const SidebarItem = ({ icon: Icon, label, active = false, onClick }) => (
  <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px', backgroundColor: active ? '#EEF2FF' : 'transparent', color: active ? '#4f46e5' : '#64748b' }}>
    <Icon size={18} /> <span style={{ fontSize: '14px', fontWeight: active ? '600' : '400' }}>{label}</span>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ prods: [], sups: [], negs: [], reps: [], logs: [], intel: [], orders: [], tasks: [] });
  const [tenantId] = useState("hackathon_demo");

  useEffect(() => { refresh(); }, [activeTab]);

  const refresh = async () => {
    try {
      const res = await fetch(`${API_BASE}/sync/${tenantId}`);
      const result = await res.json();
      if (!result.error) setData(result);
    } catch (e) { console.error("Sync error", e); }
  };

  const onResearch = async () => {
    setLoading(true);
    await fetch(`${API_BASE}/research", {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tenantId, keyword })
    });
    await refresh();
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      <aside style={{ width: '240px', borderRight: '1px solid #f1f5f9', position: 'fixed', height: '100vh', background: '#f8fafc', padding: '24px 16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}><ShieldCheck color="#4f46e5" fill="#4f46e5" size={24} /> WeaveOS</h1>
        <SidebarItem onClick={() => setActiveTab("OVERVIEW")} icon={LayoutDashboard} label="Overview" active={activeTab === "OVERVIEW"} />
        <SidebarItem onClick={() => setActiveTab("DISCOVERY")} icon={Search} label="Discovery" active={activeTab === "DISCOVERY"} />
        <SidebarItem onClick={() => setActiveTab("SHORTLISTED")} icon={List} label="Shortlisted" active={activeTab === "SHORTLISTED"} />
        <SidebarItem onClick={() => setActiveTab("SUPPLIERS")} icon={Users} label="Suppliers" active={activeTab === "SUPPLIERS"} />
        <SidebarItem onClick={() => setActiveTab("NEGOTIATIONS")} icon={MessageSquare} label="Negotiations" active={activeTab === "NEGOTIATIONS"} />
        <SidebarItem onClick={() => setActiveTab("CROSS_AGENT")} icon={BarChart3} label="Cross-Agent" active={activeTab === "CROSS_AGENT"} />
        <button onClick={async () => { setLoading(true); await fetch(`${API_BASE}/seed", {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({tenant_id:tenantId})}); await refresh(); setLoading(false); alert("Wingman Ready."); }} style={{ marginTop: 'auto', padding: '12px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Seed Demo</button>
      </aside>
      <main style={{ flex: 1, marginLeft: '240px', padding: '40px 48px' }}>
        {activeTab === "OVERVIEW" && (<><h2 style={{ fontSize: '20px', fontWeight: '700' }}>Brand Overview</h2><div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '32px' }}><div style={cardStyle}>GMV<div style={statValStyle}>₹4.2 Cr</div></div><div style={cardStyle}>SAVINGS<div style={{...statValStyle, color: '#4f46e5'}}>₹2.4L</div></div><div style={cardStyle}>ORDERS<div style={statValStyle}>{data.orders.length}</div></div><div style={cardStyle}>ROAS<div style={{...statValStyle, color: '#10b981'}}>3.14x</div></div></div></>)}
        {activeTab === "DISCOVERY" && (<><h2 style={{ fontSize: '20px', fontWeight: '700' }}>Discovery</h2><div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}><input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Organic Spices..." style={{ flex: 1, padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /><button onClick={onResearch} style={{ background: '#0f172a', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px' }}>{loading ? "Analyzing..." : "Analyze"}</button></div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginTop: '32px' }}>{data.prods.filter(p => p.status === "RESEARCHING").map((p, i) => (<div key={i} style={cardStyle}><div style={scoreCircleStyle}>{p.winningScore}</div><h4>{p.name}</h4><button style={btnDarkStyle}>Shortlist</button></div>))}</div></>)}
      </main>
    </div>
  );
}
const cardStyle = { background: 'white', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '24px', marginBottom: '16px' };
const statValStyle = { fontSize: '24px', fontWeight: '800', marginTop: '8px' };
const btnDarkStyle = { background: '#0f172a', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', marginTop: '16px' };
const scoreCircleStyle = { width: '40px', height: '40px', border: '2px solid #10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#10b981', marginBottom: '12px' };
export default App;
