import React, { useState, useEffect } from 'react';
import { ShieldCheck, LayoutDashboard, Search, List, Users, MessageSquare, FileText, Activity, History, Zap, Rocket, TrendingUp, AlertTriangle } from 'lucide-react';

const API_BASE = "https://weaveos-backend.vercel.app";

const SidebarItem = ({ icon: Icon, label, active = false, onClick }) => (
  <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px', backgroundColor: active ? '#1A1A2F' : 'transparent', color: active ? '#6366f1' : '#94a3b8' }}>
    <Icon size={18} /> <span style={{ fontSize: '14px', fontWeight: active ? '600' : '400' }}>{label}</span>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState("DISCOVERY");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ products: [], suppliers: [], negotiations: [], reports: [], logs: [], tasks: [] });
  const [tenantId] = useState("hackathon_demo");

  useEffect(() => { refresh(); }, [activeTab]);

  const refresh = async () => {
    try {
      const endpoints = ['products', 'suppliers', 'negotiations', 'reports', 'logs', 'tasks'];
      const results = await Promise.all(endpoints.map(e => fetch(`${API_BASE}/${e}/${tenantId}`).then(r => r.json())));
      setData({ products: Array.isArray(results[0]) ? results[0] : [], suppliers: Array.isArray(results[1]) ? results[1] : [], negotiations: Array.isArray(results[2]) ? results[2] : [], reports: Array.isArray(results[3]) ? results[3] : [], logs: Array.isArray(results[4]) ? results[4] : [], tasks: Array.isArray(results[5]) ? results[5] : [] });
    } catch (e) { console.error("Refresh failed", e); }
  };

  const startResearch = async () => {
    if (!keyword) return;
    setLoading(true);
    await fetch(`${API_BASE}/research`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ tenant_id: tenantId, keyword })});
    await refresh();
    setLoading(false);
  };

  const onShortlist = async (id) => {
    setLoading(true);
    await fetch(`${API_BASE}/shortlist/${id}`, { method: 'POST' });
    await refresh();
    setActiveTab("SHORTLISTED");
    setLoading(false);
  };

  const seed = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/seed`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({tenant_id:tenantId})});
      const resJson = await res.json();
      if (resJson.status === "SUCCESS") {
        await refresh();
        alert("Demo Data Seeded!");
      } else {
        alert("Seed Failed: " + resJson.message);
      }
    } catch (e) { alert("Network error during seed."); }
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: '#020205', color: '#f8fafc', minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      <aside style={{ width: '260px', borderRight: '1px solid #1e293b', padding: '24px 16px', position: 'fixed', height: '100vh', background: '#020205' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}><ShieldCheck color="#6366f1" /> D2C Wingman</h1>
        <SidebarItem onClick={() => setActiveTab("OVERVIEW")} icon={LayoutDashboard} label="Overview" active={activeTab === "OVERVIEW"} />
        <SidebarItem onClick={() => setActiveTab("DISCOVERY")} icon={Search} label="Discovery" active={activeTab === "DISCOVERY"} />
        <SidebarItem onClick={() => setActiveTab("SHORTLISTED")} icon={List} label="Shortlisted" active={activeTab === "SHORTLISTED"} />
        <SidebarItem onClick={() => setActiveTab("NEGOTIATIONS")} icon={MessageSquare} label="Negotiations" active={activeTab === "NEGOTIATIONS"} />
        <SidebarItem onClick={() => setActiveTab("REPORTS")} icon={FileText} label="Reports" active={activeTab === "REPORTS"} />
        <SidebarItem onClick={() => setActiveTab("LIVE")} icon={Activity} label="Live Intel" active={activeTab === "LIVE"} />
        <button onClick={seed} disabled={loading} style={{ marginTop: 'auto', padding: '12px', background: '#1e293b', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer' }}><Zap size={14} color="#eab308" /> {loading ? "Processing..." : "Seeding Demo"}</button>
      </aside>

      <main style={{ flex: 1, marginLeft: '260px', padding: '40px' }}>
        {activeTab === "DISCOVERY" && (
          <><h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '32px' }}>Product Discovery</h2>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', background: '#0a0a0f', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
            <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Try 'Silk Sheets'..." style={{ flex: 1, padding: '12px', background: '#020205', border: '1px solid #334155', color: 'white', borderRadius: '8px' }} />
            <button onClick={startResearch} disabled={loading} style={{ padding: '0 24px', background: '#6366f1', border: 'none', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}>{loading ? "Thinking..." : "Start Research"}</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {data.products.filter(p => p.status === "RESEARCHING").map((p, i) => (
              <div key={i} style={{ background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
                <div style={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>{p.winningScore}% WIN SCORE</div>
                <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>{p.name}</h4>
                <button onClick={() => onShortlist(p.id)} style={{ width: '100%', padding: '10px', background: '#6366f1', border: 'none', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}>Shortlist</button>
              </div>
            ))}
          </div></>
        )}

        {activeTab === "SHORTLISTED" && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {data.products.filter(p => p.status === "SHORTLISTED").map((p, i) => (
              <div key={i} style={{ background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
                <h4 style={{ fontWeight: '600' }}>{p.name}</h4>
                <div style={{ color: '#6366f1', fontSize: '12px', marginTop: '8px' }}>READY FOR SOURCING</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "NEGOTIATIONS" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.negotiations.map((n, i) => (
              <div key={i} style={{ background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <div><div style={{ fontWeight: '600' }}>{n.supplier?.name}</div><div style={{ color: '#6366f1', fontSize: '12px' }}>{n.status}</div></div>
                <button style={{ padding: '8px 16px', background: '#1A1A2F', color: '#6366f1', border: 'none', borderRadius: '6px' }}>View Thread</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "REPORTS" && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {data.reports.map((r, i) => (
              <div key={i} style={{ background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
                <div style={{ color: '#6366f1', fontSize: '11px', fontWeight: 'bold' }}>{r.type} REPORT</div>
                <h4 style={{ margin: '8px 0' }}>{r.title}</h4>
                <p style={{ fontSize: '13px', color: '#94a3b8' }}>{r.content}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "LIVE" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.tasks.map((t, i) => (
              <div key={i} style={{ background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontWeight: 'bold' }}>{t.agentName}</div>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>{t.details}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "OVERVIEW" && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div style={cardStyle}><div style={{ fontSize: '12px', color: '#475569' }}>PRODUCTS</div><div style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.products.length}</div></div>
            <div style={cardStyle}><div style={{ fontSize: '12px', color: '#475569' }}>NEGOTIATIONS</div><div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6366f1' }}>{data.negotiations.length}</div></div>
            <div style={cardStyle}><div style={{ fontSize: '12px', color: '#475569' }}>AVG ROI</div><div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>3.2x</div></div>
          </div>
        )}
      </main>
    </div>
  );
}
const cardStyle = { background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' };
export default App;
