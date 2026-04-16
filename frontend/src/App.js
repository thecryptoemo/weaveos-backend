import React, { useState } from 'react';
import { 
  ShieldCheck, LayoutDashboard, Search, List, Users, 
  MessageSquare, CheckCircle, Activity, History, 
  BarChart3, FileText, Send, Sparkles, TrendingUp, Rocket
} from 'lucide-react';

const API_BASE = "https://weaveos-backend.vercel.app";

const SidebarItem = ({ icon: Icon, label, active = false }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px',
    borderRadius: '8px', cursor: 'pointer', marginBottom: '4px',
    backgroundColor: active ? '#1A1A2F' : 'transparent',
    color: active ? '#6366f1' : '#94a3b8',
    transition: 'all 0.2s'
  }}>
    <Icon size={18} />
    <span style={{ fontSize: '14px', fontWeight: active ? '600' : '400' }}>{label}</span>
  </div>
);

function App() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [tenantId] = useState("demo_" + Math.floor(Math.random() * 1000));

  const startResearch = async () => {
    if (!keyword) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenantId, keyword })
      });
      if (res.ok) {
        const prodRes = await fetch(`${API_BASE}/products/${tenantId}`);
        const data = await prodRes.json();
        setProducts(data);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: '#020205', color: '#f8fafc', minHeight: '100vh', display: 'flex', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* SIDEBAR */}
      <aside style={{ width: '260px', borderRight: '1px solid #1e293b', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '32px', padding: '0 16px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck color="#6366f1" size={24} /> D2C Wingman
          </h1>
        </div>
        
        <div style={{ flex: 1 }}>
          <SidebarItem icon={LayoutDashboard} label="Overview" />
          <SidebarItem icon={Search} label="Discovery" active />
          <SidebarItem icon={List} label="Shortlisted" />
          <SidebarItem icon={Users} label="Suppliers" />
          <SidebarItem icon={MessageSquare} label="Negotiations" />
          <SidebarItem icon={CheckCircle} label="Approved" />
          <div style={{ margin: '20px 0 10px', padding: '0 16px', fontSize: '11px', color: '#475569', fontWeight: '600', letterSpacing: '0.05em' }}>MONITORING</div>
          <SidebarItem icon={Activity} label="Active" />
          <SidebarItem icon={History} label="History" />
          <SidebarItem icon={BarChart3} label="Cross-Agent" />
          <SidebarItem icon={FileText} label="Reports" />
        </div>

        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '20px', padding: '0 16px', color: '#475569', fontSize: '12px' }}>
          Session: {tenantId}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <header style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '8px' }}>Product Discovery</h2>
          <p style={{ color: '#94a3b8' }}>Discover winning products and reliable suppliers using D2C Wingman AI Agents.</p>
        </header>

        {/* SEARCH BOX */}
        <section style={{ 
          background: 'linear-gradient(145deg, #0a0a14 0%, #11111f 100%)', 
          border: '1px solid #1e293b', borderRadius: '16px', padding: '32px', marginBottom: '40px' 
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Sparkles size={18} color="#6366f1" /> New Product Research
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: '#475569', display: 'block', marginBottom: '8px' }}>PRODUCT NAME / KEYWORD</label>
                <input 
                  value={keyword} 
                  onChange={(e) => setKeyword(e.target.value)} 
                  placeholder="e.g., Bamboo toothbrushes, Organic spices..." 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#020205', color: 'white', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ width: '200px' }}>
                <label style={{ fontSize: '12px', color: '#475569', display: 'block', marginBottom: '8px' }}>CATEGORY</label>
                <select style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#020205', color: 'white' }}>
                  <option>Personal Care</option>
                  <option>Home & Kitchen</option>
                  <option>Electronics</option>
                </select>
              </div>
            </div>
            <button 
              onClick={startResearch} 
              disabled={loading}
              style={{ 
                padding: '14px', background: '#6366f1', color: 'white', border: 'none', 
                borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              {loading ? <div className="spinner"></div> : <Rocket size={18} />}
              {loading ? "Agent Orchestrating..." : "Start Research"}
            </button>
          </div>
        </section>

        {/* RESULTS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {products.map((p, i) => (
            <div key={i} style={{ 
              background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '16px', 
              padding: '24px', transition: 'transform 0.2s', cursor: 'default'
            }} onMouseOver={(e) => e.currentTarget.style.borderColor = '#6366f1'} onMouseOut={(e) => e.currentTarget.style.borderColor = '#1e293b'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                <div style={{ background: '#064e3b', color: '#10b981', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={12} /> {p.winningScore}% WIN SCORE
                </div>
                <div style={{ fontSize: '12px', color: '#475569' }}>#124 BSR</div>
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>{p.name}</h4>
              <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>
                Potential Margin: <span style={{ color: '#f8fafc', fontWeight: '600' }}>32%</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #334155', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>View Report</button>
                <button style={{ flex: 1, padding: '10px', background: '#f8fafc', border: 'none', color: '#020205', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Shortlist</button>
              </div>
            </div>
          ))}
        </div>

        {/* QUICK ACTIONS BAR */}
        <div style={{ position: 'fixed', bottom: '40px', left: '300px', right: '40px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button style={quickActionStyle}>What's the status of my sourcing agents?</button>
          <button style={quickActionStyle}>Find me suppliers for yoga mats</button>
          <button style={quickActionStyle}>Summarize negotiation activity</button>
        </div>
      </main>
      
      <style>{`
        .spinner {
          width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%;
          border-top-color: #fff; animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const quickActionStyle = {
  padding: '10px 20px', background: '#0a0a0f', border: '1px solid #1e293b', color: '#94a3b8', 
  borderRadius: '20px', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
};

export default App;
