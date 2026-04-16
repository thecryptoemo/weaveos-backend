import React, { useState } from 'react';
import { 
  ShieldCheck, LayoutDashboard, Search, List, Users, 
  MessageSquare, CheckCircle, Activity, History, 
  BarChart3, FileText, Send, Sparkles, TrendingUp, Rocket,
  AlertCircle
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
  const [error, setError] = useState(null);
  const [tenantId] = useState("demo_" + Math.floor(Math.random() * 10000));

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
      
      if (!res.ok) {
        throw new Error(`API Error: ${res.status} - Check if Backend is operational.`);
      }

      const prodRes = await fetch(`${API_BASE}/products/${tenantId}`);
      const data = await prodRes.json();
      setProducts(data);
    } catch (err) { 
      console.error(err);
      setError("Failed to connect to AI Gateway. Ensure you are using the correct Backend URL.");
    }
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
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '8px' }}>Product Discovery</h2>
            <p style={{ color: '#94a3b8' }}>Orchestrating AI Agents to find your next winning product.</p>
          </div>
          <div style={{ background: '#11111A', padding: '8px 16px', borderRadius: '8px', border: '1px solid #1e293b', fontSize: '12px', color: '#475569' }}>
            Session ID: <span style={{ color: '#6366f1' }}>{tenantId}</span>
          </div>
        </header>

        {/* ERROR TOAST */}
        {error && (
          <div style={{ background: '#450a0a', border: '1px solid #991b1b', color: '#fca5a5', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={20} />
            <div>
              <strong>Connectivity Issue:</strong> {error}
            </div>
          </div>
        )}

        {/* SEARCH BOX */}
        <section style={{ 
          background: 'linear-gradient(145deg, #0a0a14 0%, #11111f 100%)', 
          border: '1px solid #1e293b', borderRadius: '16px', padding: '32px', marginBottom: '40px' 
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Sparkles size={18} color="#6366f1" /> Launch Discovery Agent
          </h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              value={keyword} 
              onChange={(e) => setKeyword(e.target.value)} 
              placeholder="e.g., Organic Yoga Mats, Bamboo Brushes..." 
              style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid #334155', background: '#020205', color: 'white', fontSize: '15px' }}
            />
            <button 
              onClick={startResearch} 
              disabled={loading}
              style={{ 
                padding: '0 32px', background: '#6366f1', color: 'white', border: 'none', 
                borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', 
                display: 'flex', alignItems: 'center', gap: '10px'
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
              padding: '24px', transition: 'all 0.3s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                <div style={{ background: '#064e3b', color: '#10b981', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={12} /> {p.winningScore}% WIN SCORE
                </div>
                <div style={{ fontSize: '12px', color: '#475569' }}>Verified Demand</div>
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{p.name}</h4>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>AI-detected gap: Competitors lack durability in high-heat environments.</p>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#11111A', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Landed Cost</div>
                  <div style={{ fontSize: '18px', fontWeight: '700' }}>₹{p.price * 0.4}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Est. Margin</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>34%</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #334155', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>View Brief</button>
                <button style={{ flex: 1, padding: '10px', background: '#6366f1', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Negotiate</button>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '120px 0', border: '2px dashed #1e293b', borderRadius: '24px' }}>
            <div style={{ color: '#475569', fontSize: '16px' }}>Ready to orchestrate. Enter a product name to begin discovery.</div>
          </div>
        )}
      </main>
      
      <style>{`
        .spinner {
          width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%;
          border-top-color: #fff; animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default App;
