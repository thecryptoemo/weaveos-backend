import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, LayoutDashboard, Search, List, Users, 
  MessageSquare, CheckCircle, Activity, History, 
  BarChart3, FileText, Send, Sparkles, TrendingUp, Rocket,
  AlertCircle, ChevronRight, Mail, Clock, ArrowUpRight, Zap, Target
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
  const [suppliers, setSuppliers] = useState([]);
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

      const supRes = await fetch(`${API_BASE}/suppliers/${tenantId}`);
      if (supRes.ok) setSuppliers(await supRes.json());

      const negRes = await fetch(`${API_BASE}/negotiations/${tenantId}`);
      if (negRes.ok) setNegotiations(await negRes.json());

      const repRes = await fetch(`${API_BASE}/reports/${tenantId}`);
      if (repRes.ok) setReports(await repRes.json());
    } catch (err) {}
  };

  const seedDemoData = async () => {
    setLoading(true);
    await fetch(`${API_BASE}/seed", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tenantId })
    });
    await refreshAllData();
    setLoading(false);
    alert("Demo suite live! check tabs.");
  };

  const startResearch = async () => {
    if (!keyword) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/research", {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenantId, keyword })
      });
      if (!res.ok) throw new Error("API Error");
      await refreshAllData();
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const startNegotiation = async (target) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/negotiate", {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId, supplier_id: target.id || "demo",
          supplier_email: "sales@partner.com",
          target_price: (target.price || 1000) * 0.7
        })
      });
      if (res.ok) {
        alert("Agent Negotiation Chain Started!");
        setActiveTab("NEGOTIATIONS");
      }
    } catch (err) {}
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: '#020205', color: '#f8fafc', minHeight: '100vh', display: 'flex', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <aside style={{ width: '260px', borderRight: '1px solid #1e293b', padding: '24px 16px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 10 }}>
        <div style={{ marginBottom: '32px', padding: '0 16px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}><ShieldCheck color="#6366f1" size={24} /> D2C Wingman</h1>
        </div>
        <div style={{ flex: 1 }}>
          <SidebarItem onClick={() => setActiveTab("OVERVIEW")} icon={LayoutDashboard} label="Overview" active={activeTab === "OVERVIEW"} />
          <SidebarItem onClick={() => setActiveTab("DISCOVERY")} icon={Search} label="Discovery" active={activeTab === "DISCOVERY"} />
          <SidebarItem onClick={() => setActiveTab("SHORTLISTED")} icon={List} label="Shortlisted" active={activeTab === "SHORTLISTED"} />
          <SidebarItem onClick={() => setActiveTab("SUPPLIERS")} icon={Users} label="Suppliers" active={activeTab === "SUPPLIERS"} />
          <SidebarItem onClick={() => setActiveTab("NEGOTIATIONS")} icon={MessageSquare} label="Negotiations" active={activeTab === "NEGOTIATIONS"} />
          <SidebarItem onClick={() => setActiveTab("REPORTS")} icon={FileText} label="Reports" active={activeTab === "REPORTS"} />
          <div style={{ margin: '20px 0 10px', padding: '0 16px', fontSize: '11px', color: '#475569', fontWeight: '600', letterSpacing: '0.05em' }}>MONITORING</div>
          <SidebarItem icon={Activity} label="Live Ops" />
          <SidebarItem icon={History} label="History" />
        </div>
        <button onClick={seedDemoData} style={{ marginBottom: '20px', padding: '12px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}><Zap size={14} color="#eab308" /> Prepare Demo Data</button>
      </aside>
      <main style={{ flex: 1, marginLeft: '260px', padding: '40px', overflowY: 'auto' }}>
        {activeTab === "DISCOVERY" && (
          <>
            <h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '8px' }}>Discovery</h2>
            <p style={{ color: '#94a3b8', marginBottom: '40px' }}>Launch autonomous sourcing agents.</p>
            <section style={{ background: 'linear-gradient(145deg, #0a0a14 0%, #11111f 100%)', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px', marginBottom: '40px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g. Bamboo Brushes..." style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid #334155', background: '#020205', color: 'white', fontSize: '15px' }} />
                <button onClick={startResearch} disabled={loading} style={{ padding: '0 32px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>{loading ? "Agent Thinking..." : "Start Research"}</button>
              </div>
            </section>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {products.filter(p => p.status === "RESEARCHING").map((p, i) => (
                <div key={i} style={cardStyle}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}><div style={badgeStyle}>{p.winningScore}% WIN SCORE</div></div><h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>{p.name}</h4><div style={{ display: 'flex', gap: '8px' }}><button style={btnOutlineStyle}>Shortlist</button><button onClick={() => startNegotiation(p)} style={btnPrimaryStyle}>Negotiate</button></div></div>
              ))}
              {products.filter(p => p.status === "RESEARCHING").length === 0 && !loading && <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px', border: '2px dashed #1e293b', borderRadius: '16px', color: '#475569' }}>No active research.</div>}
            </div>
          </>
        )}
        {activeTab === "SHORTLISTED" && (
          <>
            <h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '32px' }}>Shortlisted Products</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {products.filter(p => p.status === "SHORTLISTED").map((p, i) => (
                <div key={i} style={cardStyle}><h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>{p.name}</h4><p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>Category: {p.category}</p><button onClick={() => setActiveTab("SUPPLIERS")} style={btnPrimaryStyle}>Discovery Suppliers</button></div>
              ))}
              {products.filter(p => p.status === "SHORTLISTED").length === 0 && <p style={{ color: '#475569' }}>No products shortlisted yet.</p>}
            </div>
          </>
        )}
        {activeTab === "SUPPLIERS" && (
          <>
            <h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '32px' }}>Verified Suppliers</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {suppliers.map((s, i) => (
                <div key={i} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><div style={{ fontWeight: '600', fontSize: '16px' }}>{s.name}</div><div style={{ fontSize: '12px', color: '#94a3b8' }}>Product: {s.product?.name} | Price: ₹{s.price}</div></div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><div style={{ color: '#eab308', fontWeight: 'bold' }}>{s.rating} ★</div><button onClick={() => startNegotiation(s)} style={btnPrimaryStyle}>Start Negotiation</button></div>
                </div>
              ))}
              {suppliers.length === 0 && <p style={{ color: '#475569' }}>No suppliers discovered yet.</p>}
            </div>
          </>
        )}
        {activeTab === "NEGOTIATIONS" && (
          <>
            <h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '32px' }}>Active Negotiations</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {negotiations.map((n, i) => (
                <div key={i} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}><div style={{ width: '40px', height: '40px', background: '#1A1A2F', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={20} color="#6366f1" /></div><div><div style={{ fontWeight: '600' }}>{n.supplier?.name}</div><div style={{ fontSize: '12px', color: '#6366f1' }}>{n.status}</div></div></div>
                  <button style={btnOutlineStyle}>View Thread</button>
                </div>
              ))}
              {negotiations.length === 0 && <p style={{ color: '#475569' }}>No active negotiations.</p>}
            </div>
          </>
        )}
        {activeTab === "REPORTS" && (
          <>
            <h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '32px' }}>Intelligence Reports</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {reports.map((r, i) => (
                <div key={i} style={cardStyle}><div style={{ color: '#6366f1', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>{r.type}</div><h3 style={{ marginBottom: '12px' }}>{r.title}</h3><p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5' }}>{r.content}</p></div>
              ))}
              {reports.length === 0 && <p style={{ color: '#475569' }}>No reports found.</p>}
            </div>
          </>
        )}
        {activeTab === "OVERVIEW" && (
          <>
            <h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '32px' }}>Brand Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
              <div style={statCardStyle}><div style={statLabelStyle}>TOTAL PRODUCTS</div><div style={statValStyle}>{products.length}</div></div>
              <div style={statCardStyle}><div style={statLabelStyle}>ACTIVE AGENTS</div><div style={{ ...statValStyle, color: '#6366f1' }}>{negotiations.length + (loading ? 1 : 0)}</div></div>
              <div style={statCardStyle}><div style={statLabelStyle}>EST. ROI</div><div style={{ ...statValStyle, color: '#10b981' }}>2.8x</div></div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
const cardStyle = { background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' };
const badgeStyle = { background: '#064e3b', color: '#10b981', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px' };
const btnPrimaryStyle = { padding: '10px 16px', background: '#6366f1', border: 'none', color: 'white', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' };
const btnOutlineStyle = { padding: '10px 16px', background: 'transparent', border: '1px solid #334155', color: 'white', borderRadius: '8px', cursor: 'pointer' };
const statCardStyle = { background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' };
const statLabelStyle = { color: '#475569', fontSize: '12px' };
const statValStyle = { fontSize: '32px', fontWeight: '700', marginTop: '8px' };
export default App;
