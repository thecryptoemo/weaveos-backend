import React, { useState } from 'react';
import { TrendingUp, ShieldCheck } from 'lucide-react';

const API_BASE = "https://weaveos-backend.vercel.app";

function App() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [tenantId] = useState("demo_" + Math.floor(Math.random() * 1000));

  const startResearch = async () => {
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
    <div style={{ backgroundColor: '#0A0A0F', color: 'white', minHeight: '100vh', padding: '40px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck color="#6366f1" /> WeaveOS
        </h1>
        <div style={{ color: '#888' }}>Session: {tenantId}</div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ background: '#11111A', border: '1px solid #222', borderRadius: '12px', padding: '30px', marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '20px' }}>AI Sourcing Agent</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              value={keyword} 
              onChange={(e) => setKeyword(e.target.value)} 
              placeholder="Enter product name..." 
              style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #333', background: '#05050A', color: 'white' }}
            />
            <button 
              onClick={startResearch} 
              disabled={loading}
              style={{ padding: '0 24px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              {loading ? "Thinking..." : "Analyze"}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {products.map((p, i) => (
            <div key={i} style={{ background: '#11111A', border: '1px solid #222', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <TrendingUp size={16} color="#10b981" />
                <span style={{ color: '#10b981' }}>{p.winningScore}% Score</span>
              </div>
              <h3>{p.name}</h3>
              <button style={{ marginTop: '15px', width: '100%', padding: '10px', background: 'transparent', border: '1px solid #333', color: 'white', borderRadius: '6px' }}>
                Negotiate
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
