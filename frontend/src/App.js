import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, LayoutDashboard, Search, List, Users, 
  MessageSquare, CheckCircle, Activity, History, 
  BarChart3, FileText, Send, Sparkles, TrendingUp, Rocket,
  AlertCircle, ChevronRight, Mail, Clock, ArrowUpRight
} from 'lucide-react';

const API_BASE = "https://weaveos-backend.vercel.app";

const SidebarItem = ({ icon: Icon, label, active = false, onClick }) => (
  <div 
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px',
      borderRadius: '8px', cursor: 'pointer', marginBottom: '4px',
      backgroundColor: active ? '#1A1A2F' : 'transparent', 
      color: active ? '#6366f1' : '#94a3b8',
      transition: 'all 0.2s',
      userSelect: 'none'
    }}
  >
    <Icon size={18} />
    <span style={{ fontSize: '14px', fontWeight: active ? '600' : '400' }}>{label}</span>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState("DISCOVERY");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [negotiations, setNegotiations] = useState([]);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [tenantId] = useState("hackathon_demo");

  useEffect(() => {
    refreshAllData();
  }, [activeTab]);

  const refreshAllData = async () => {
    try {
      const prodRes = await fetch(`${API_BASE}/products/${tenantId}`);
      if (prodRes.ok) setProducts(await prodRes.json());

      const negRes = await fetch(`${API_BASE}/negotiations/${tenantId}`);
      if (negRes.ok) setNegotiations(await negRes.json());

      const repRes = await fetch(`${API_BASE}/reports/${tenantId}`);
      if (repRes.ok) setReports(await repRes.json());
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  const startResearch = async () => {
    if (!keyword) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenantId, keyword })
      });
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      await refreshAllData();
    } catch (err) { 
      setError(err.message); 
    }
    setLoading(false);
  };

  const triggerNegotiation = async (product) => {
    try {
      const res = await fetch(`${API_BASE}/negotiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          supplier_id: "supplier_" + Math.floor(Math.random()*1000),
          supplier_email: "sales@d2c-supplier.in",
          target_price: product.price * 0.7
        })
      });
      if (res.ok) {
        alert("D2C Wingman has sent a negotiation email!");
        setActiveTab("NEGOTIATIONS");
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ backgroundColor: '#020205', color: '#f8fafc', minHeight: '100vh', display: 'flex', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <aside style={{ width: '260px', borderRight: '1px solid #1e293b', padding: '24px 16px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' }}>
        <div style={{ marginBottom: '32px', padding: '0 16px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck color="#6366f1" size={24} /> D2C Wingman
          </h1>
        </div>
        <div style={{ flex: 1 }}>
          <SidebarItem onClick={() => setActiveTab("OVERVIEW")} icon={LayoutDashboard} label="Overview" active={activeTab === "OVERVIEW"} />
          <SidebarItem onClick={() => setActiveTab("DISCOVERY")} icon={Search} label="Discovery" active={activeTab === "DISCOVERY"} />
          <SidebarItem onClick={() => setActiveTab("NEGOTIATIONS")} icon={MessageSquare} label="Negotiations" active={activeTab === "NEGOTIATIONS"} />
          <SidebarItem onClick={() => setActiveTab("REPORTS")} icon={FileText} label="Reports" active={activeTab === "REPORTS"} />
          <div style={{ margin: '20px 0 10px', padding: '0 16px', fontSize: '11px', color: '#475569', fontWeight: '600', letterSpacing: '0.05em' }}>DEMO ONLY</div>
          <SidebarItem icon={List} label="Shortlisted" />
          <SidebarItem icon={Users} label="Suppliers" />
        </div>
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '20px', padding: '0 16px', color: '#475569', fontSize: '11px' }}>LIVE AGENT GATEWAY READY</div>
      </aside>

      <main style={{ flex: 1, marginLeft: '260px', padding: '40px', overflowY: 'auto' }}>
        {activeTab === "DISCOVERY" && (
          <>
            <header style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '8px' }}>Discovery</h2>
              <p style={{ color: '#94a3b8' }}>Search any product to trigger the autonomous sourcing chain.</p>
            </header>
            <section style={{ background: 'linear-gradient(145deg, #0a0a14 0%, #11111f 100%)', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px', marginBottom: '40px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                  value={keyword} onChange={(e) => setKeyword(e.target.value)} 
                  placeholder="e.g. Bamboo Brushes, Yoga Mats..." 
                  style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid #334155', background: '#020205', color: 'white', fontSize: '15px' }}
                />
                <button onClick={startResearch} disabled={loading} style={{ padding: '0 32px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
                  {loading ? "Agent Orchestrating..." : "Start Research"}
                </button>
              </div>
            </section>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {products.length === 0 && !loading && <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px', border: '2px dashed #1e293b', borderRadius: '16px', color: '#475569' }}>No active research. Try searching above!</div>}
              {products.map((p, i) => (
                <div key={i} style={{ background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ background: '#064e3b', color: '#10b981', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px' }}>{p.winningScore}% WIN SCORE</div>
                  </div>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>{p.name}</h4>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #334155', color: 'white', borderRadius: '8px' }}>Shortlist</button>
                    <button onClick={() => triggerNegotiation(p)} style={{ flex: 1, padding: '10px', background: '#6366f1', border: 'none', color: 'white', borderRadius: '8px', fontWeight: '600' }}>Negotiate</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {activeTab === "NEGOTIATIONS" && (
          <>
            <h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '32px' }}>Negotiations</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {negotiations.length === 0 && <p style={{ color: '#475569' }}>No active negotiations.</p>}
              {negotiations.map((n, i) => (
                <div key={i} style={{ background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{n.supplier.name}</div>
                    <div style={{ fontSize: '12px', color: '#6366f1' }}>{n.status}</div>
                  </div>
                  <button style={{ padding: '8px 16px', background: '#1A1A2F', color: '#6366f1', border: 'none', borderRadius: '6px' }}>View Thread</button>
                </div>
              ))}
            </div>
          </>
        )}
        {activeTab === "REPORTS" && (
          <>
            <h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '32px' }}>Intelligence Reports</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {reports.length === 0 && <p style={{ color: '#475569' }}>No reports found.</p>}
              {reports.map((r, i) => (
                <div key={i} style={{ background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ color: '#6366f1', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>{r.type}</div>
                  <h3 style={{ marginBottom: '12px' }}>{r.title}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5' }}>{r.content}</p>
                </div>
              ))}
            </div>
          </>
        )}
        {activeTab === "OVERVIEW" && (
          <>
            <h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '32px' }}>Brand Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
              <div style={statCardStyle}><div style={{ color: '#475569', fontSize: '12px' }}>LIVE PRODUCTS</div><div style={{ fontSize: '32px', fontWeight: '700', marginTop: '8px' }}>{products.length}</div></div>
              <div style={statCardStyle}><div style={{ color: '#475569', fontSize: '12px' }}>ACTIVE AGENTS</div><div style={{ fontSize: '32px', fontWeight: '700', marginTop: '8px', color: '#6366f1' }}>{negotiations.length + (loading ? 1 : 0)}</div></div>
              <div style={statCardStyle}><div style={{ color: '#475569', fontSize: '12px' }}>PROJECTED MARGIN</div><div style={{ fontSize: '32px', fontWeight: '700', marginTop: '8px', color: '#10b981' }}>32.4%</div></div>
            </div>
          </>
        )}
      </main>
      <style>{` .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: #fff; animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } } `}</style>
    </div>
  );
}
const statCardStyle = { background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' };
export default App;
