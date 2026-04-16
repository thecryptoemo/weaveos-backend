import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, LayoutDashboard, Search, List, Users, 
  MessageSquare, CheckCircle, Activity, History, 
  BarChart3, FileText, Send, Sparkles, TrendingUp, Rocket,
  AlertCircle, ChevronRight, Mail, Clock
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
      transition: 'all 0.2s'
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
  const [tenantId] = useState("demo_" + Math.floor(Math.random() * 10000));

  useEffect(() => {
    if (activeTab === "NEGOTIATIONS") fetchNegotiations();
    if (activeTab === "REPORTS") fetchReports();
    if (activeTab === "DISCOVERY" && products.length === 0) fetchResults();
  }, [activeTab]);

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
      fetchResults();
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const startNegotiation = async (product) => {
    try {
      const res = await fetch(`${API_BASE}/negotiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          supplier_id: "demo_supplier",
          supplier_email: "sales@supplier.com",
          target_price: product.price * 0.7
        })
      });
      if (res.ok) {
        alert("AI Agent has initiated email negotiation!");
        setActiveTab("NEGOTIATIONS");
      }
    } catch (err) { console.error(err); }
  };

  const fetchResults = async () => {
    try {
      const res = await fetch(`${API_BASE}/products/${tenantId}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {}
  };

  const fetchNegotiations = async () => {
    try {
      const res = await fetch(`${API_BASE}/negotiations/${tenantId}`);
      const data = await res.json();
      setNegotiations(data);
    } catch (err) {}
  };

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_BASE}/reports/${tenantId}`);
      const data = await res.json();
      setReports(data);
    } catch (err) {}
  };

  return (
    <div style={{ backgroundColor: '#020205', color: '#f8fafc', minHeight: '100vh', display: 'flex', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <aside style={{ width: '260px', borderRight: '1px solid #1e293b', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '32px', padding: '0 16px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck color="#6366f1" size={24} /> D2C Wingman
          </h1>
        </div>
        
        <div style={{ flex: 1 }}>
          <SidebarItem onClick={() => setActiveTab("OVERVIEW")} icon={LayoutDashboard} label="Overview" active={activeTab === "OVERVIEW"} />
          <SidebarItem onClick={() => setActiveTab("DISCOVERY")} icon={Search} label="Discovery" active={activeTab === "DISCOVERY"} />
          <SidebarItem onClick={() => setActiveTab("SHORTLISTED")} icon={List} label="Shortlisted" active={activeTab === "SHORTLISTED"} />
          <SidebarItem onClick={() => setActiveTab("SUPPLIERS")} icon={Users} label="Suppliers" active={activeTab === "SUPPLIERS"} />
          <SidebarItem onClick={() => setActiveTab("NEGOTIATIONS")} icon={MessageSquare} label="Negotiations" active={activeTab === "NEGOTIATIONS"} />
          <SidebarItem onClick={() => setActiveTab("APPROVED")} icon={CheckCircle} label="Approved" active={activeTab === "APPROVED"} />
          <div style={{ margin: '20px 0 10px', padding: '0 16px', fontSize: '11px', color: '#475569', fontWeight: '600', letterSpacing: '0.05em' }}>MONITORING</div>
          <SidebarItem icon={Activity} label="Active" />
          <SidebarItem icon={History} label="History" />
          <SidebarItem onClick={() => setActiveTab("REPORTS")} icon={FileText} label="Reports" active={activeTab === "REPORTS"} />
        </div>
      </aside>

      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {activeTab === "DISCOVERY" && (
          <>
            <header style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '8px' }}>Product Discovery</h2>
              <p style={{ color: '#94a3b8' }}>Search any product to launch the D2C Wingman agents.</p>
            </header>

            <section style={{ background: 'linear-gradient(145deg, #0a0a14 0%, #11111f 100%)', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px', marginBottom: '40px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <Sparkles size={18} color="#6366f1" /> New Product Research
              </h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                  value={keyword} onChange={(e) => setKeyword(e.target.value)} 
                  placeholder="Try: 'Organic Coffee', 'Gaming Chairs'..." 
                  style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid #334155', background: '#020205', color: 'white', fontSize: '15px' }}
                />
                <button onClick={startResearch} disabled={loading} style={{ padding: '0 32px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {loading ? <div className="spinner"></div> : <Rocket size={18} />}
                  {loading ? "Agent Orchestrating..." : "Start Research"}
                </button>
              </div>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {products.map((p, i) => (
                <div key={i} style={{ background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ background: '#064e3b', color: '#10b981', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px' }}>{p.winningScore}% WIN SCORE</div>
                  </div>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>{p.name}</h4>
                  <div style={{ padding: '12px', background: '#11111A', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '20px' }}>
                    <div style={{ fontSize: '10px', color: '#475569' }}>MARKET PRICE</div>
                    <div style={{ fontSize: '18px', fontWeight: '700' }}>₹{p.price}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #334155', color: 'white', borderRadius: '8px' }}>Shortlist</button>
                    <button onClick={() => startNegotiation(p)} style={{ flex: 1, padding: '10px', background: '#6366f1', border: 'none', color: 'white', borderRadius: '8px', fontWeight: '600' }}>Negotiate</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "NEGOTIATIONS" && (
          <>
            <header style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '8px' }}>Active Negotiations</h2>
              <p style={{ color: '#94a3b8' }}>D2C Wingman is currently talking to these suppliers.</p>
            </header>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {negotiations.length === 0 && <div style={{ color: '#475569' }}>No active negotiations yet.</div>}
              {negotiations.map((n, i) => (
                <div key={i} style={{ background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', background: '#1A1A2F', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={20} color="#6366f1" /></div>
                    <div>
                      <div style={{ fontWeight: '600' }}>{n.supplier.name}</div>
                      <div style={{ fontSize: '12px', color: '#475569' }}>Status: {n.status}</div>
                    </div>
                  </div>
                  <button style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #334155', color: 'white', borderRadius: '6px' }}>View Chat</button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "REPORTS" && (
          <>
            <header style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '8px' }}>Agent Reports</h2>
              <p style={{ color: '#94a3b8' }}>Historical data and insights generated by your agents.</p>
            </header>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {reports.length === 0 && <div style={{ color: '#475569' }}>No reports generated yet. Run a research first.</div>}
              {reports.map((r, i) => (
                <div key={i} style={{ background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', marginBottom: '12px' }}>
                    <FileText size={16} /> <span style={{ fontSize: '12px', fontWeight: '600' }}>{r.type}</span>
                  </div>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>{r.title}</h4>
                  <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '24px' }}>{r.content}</p>
                  <button style={{ width: '100%', padding: '10px', background: '#1A1A2F', border: 'none', color: '#6366f1', borderRadius: '6px', fontWeight: '600' }}>Open Detailed Brief</button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "OVERVIEW" && (
          <>
            <header style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '8px' }}>Brand Overview</h2>
            </header>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div style={{ background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
                <div style={{ color: '#475569', fontSize: '12px', marginBottom: '8px' }}>TOTAL PRODUCTS</div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>{products.length}</div>
              </div>
              <div style={{ background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
                <div style={{ color: '#475569', fontSize: '12px', marginBottom: '8px' }}>ACTIVE NEGOTIATIONS</div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>{negotiations.length}</div>
              </div>
              <div style={{ background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
                <div style={{ color: '#475569', fontSize: '12px', marginBottom: '8px' }}>TRUE ROAS (AVG)</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>2.14x</div>
              </div>
            </div>
          </>
        )} 

        <div style={{ position: 'fixed', bottom: '40px', left: '300px', right: '40px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={() => setActiveTab("OVERVIEW")} style={quickActionStyle}>Status Report</button>
          <button onClick={() => { setKeyword("Coffee Maker"); startResearch(); }} style={quickActionStyle}>Demo: Coffee</button>
          <button onClick={() => { setKeyword("Silk Sheets"); startResearch(); }} style={quickActionStyle}>Demo: Silk</button>
        </div>
      </main>
      
      <style>{` .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: #fff; animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } } `}</style>
    </div>
  );
}

const quickActionStyle = { padding: '10px 20px', background: '#0a0a0f', border: '1px solid #1e293b', color: '#94a3b8', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' };
export default App;
