import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, LayoutDashboard, Search, List, Users, 
  MessageSquare, CheckCircle, Activity, History, 
  BarChart3, FileText, Send, Sparkles, TrendingUp, Rocket,
  AlertCircle, ChevronRight, Mail, Clock, ArrowUpRight, Zap, Target,
  MessageCircle, X, Terminal, ArrowRight, ClipboardList, Cpu
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
  const [logs, setLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedNegotiation, setSelectedNegotiation] = useState(null);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', text: "Hello! I'm your D2C Wingman. I'm ready to find your next winning product or handle your supplier negotiations. What can I do for you?" }
  ]);
  const chatEndRef = useRef(null);
  const [tenantId] = useState("hackathon_demo");

  useEffect(() => { refreshAllData(); }, [activeTab]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

  const refreshAllData = async () => {
    try {
      const pRes = await fetch(`${API_BASE}/products/${tenantId}`);
      if (pRes.ok) setProducts(await pRes.json());

      const sRes = await fetch(`${API_BASE}/suppliers/${tenantId}`);
      if (sRes.ok) setSuppliers(await sRes.json());

      const nRes = await fetch(`${API_BASE}/negotiations/${tenantId}`);
      if (nRes.ok) setNegotiations(await nRes.json());

      const rRes = await fetch(`${API_BASE}/reports/${tenantId}`);
      if (rRes.ok) setReports(await rRes.json());

      const lRes = await fetch(`${API_BASE}/logs/${tenantId}`);
      if (lRes.ok) setLogs(await lRes.json());

      const tRes = await fetch(`${API_BASE}/tasks/${tenantId}`);
      if (tRes.ok) setTasks(await tRes.json());
    } catch (err) { console.error("Sync failed", err); }
  };

  const seed = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/seed`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({tenant_id: tenantId})});
      const data = await res.json();
      if (data.status === "ERROR") setError(`Seed Failed: ${data.message}`);
      else { await refreshAllData(); alert("Demo data seeded!"); }
    } catch (err) { setError("Backend offline."); }
    setLoading(false);
  };

  const startResearch = async () => {
    if (!keyword) return;
    setLoading(true);
    try {
      await fetch(`${API_BASE}/research`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tenant_id: tenantId, keyword }) });
      await refreshAllData();
    } catch (err) { setError("Discovery agent offline."); }
    setLoading(false);
  };

  const onShortlist = async (id) => {
    setLoading(true);
    await fetch(`${API_BASE}/shortlist/${id}`, { method: 'POST' });
    await refreshAllData();
    setActiveTab("SHORTLISTED");
    setLoading(false);
  };

  const onDiscoverSuppliers = async (id) => {
    setLoading(true);
    await fetch(`${API_BASE}/discover-suppliers/${id}`, { method: 'POST' });
    await refreshAllData();
    setActiveTab("SUPPLIERS");
    setLoading(false);
  };

  const onNegotiate = async (target) => {
    setLoading(true);
    await fetch(`${API_BASE}/negotiate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tenant_id: tenantId, supplier_id: target.id, supplier_email: "sales@partner.in", target_price: (target.price || 1500) * 0.7 }) });
    await refreshAllData();
    setActiveTab("NEGOTIATIONS");
    setLoading(false);
  };

  const sendChatMessage = async () => {
    if (!chatMessage) return;
    const userText = chatMessage;
    setChatHistory([...chatHistory, { role: 'user', text: userText }]);
    setChatMessage("");
    try {
      const res = await fetch(`${API_BASE}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tenant_id: tenantId, message: userText }) });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'assistant', text: data.reply }]);
    } catch (err) { setChatHistory(prev => [...prev, { role: 'assistant', text: "Link fuzzy." }]); }
  };

  return (
    <div style={{ backgroundColor: '#020205', color: '#f8fafc', minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      <aside style={{ width: '260px', borderRight: '1px solid #1e293b', padding: '24px 16px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', background: '#020205' }}>
        <div style={{ marginBottom: '32px', padding: '0 16px' }}><h1 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}><ShieldCheck color="#6366f1" size={24} /> D2C Wingman</h1></div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <SidebarItem onClick={() => setActiveTab("OVERVIEW")} icon={LayoutDashboard} label="Overview" active={activeTab === "OVERVIEW"} />
          <SidebarItem onClick={() => setActiveTab("DISCOVERY")} icon={Search} label="Discovery" active={activeTab === "DISCOVERY"} />
          <SidebarItem onClick={() => setActiveTab("SHORTLISTED")} icon={List} label="Shortlisted" active={activeTab === "SHORTLISTED"} />
          <SidebarItem onClick={() => setActiveTab("SUPPLIERS")} icon={Users} label="Suppliers" active={activeTab === "SUPPLIERS"} />
          <SidebarItem onClick={() => setActiveTab("NEGOTIATIONS")} icon={MessageSquare} label="Negotiations" active={activeTab === "NEGOTIATIONS"} />
          <SidebarItem onClick={() => setActiveTab("REPORTS")} icon={FileText} label="Reports" active={activeTab === "REPORTS"} />
          <div style={{ margin: '20px 0 10px', padding: '0 16px', fontSize: '11px', color: '#475569', fontWeight: '600' }}>MONITORING</div>
          <SidebarItem onClick={() => setActiveTab("LIVE_INTEL")} icon={Activity} label="Live Intelligence" active={activeTab === "LIVE_INTEL"} />
          <SidebarItem onClick={() => setActiveTab("AUDIT_LOGS")} icon={History} label="Audit Logs" active={activeTab === "AUDIT_LOGS"} />
        </div>
        {error && <div style={{ color: '#fca5a5', fontSize: '11px', padding: '10px' }}>{error}</div>}
        <button onClick={seed} disabled={loading} style={{ marginBottom: '20px', padding: '12px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}><Zap size={14} color="#eab308" /> Seeding Demo Data</button>
      </aside>
      <main style={{ flex: 1, marginLeft: '260px', padding: '40px' }}>
        {activeTab === "DISCOVERY" && (
          <><h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '8px' }}>Product Discovery</h2><p style={{ color: '#94a3b8', marginBottom: '40px' }}>Autonomous sourcing agents at your command.</p>
            <section style={{ background: 'linear-gradient(145deg, #0a0a14 0%, #11111f 100%)', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px', marginBottom: '40px' }}>
              <div style={{ display: 'flex', gap: '12px' }}><input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Search: 'Silk Sheets'..." style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid #334155', background: '#020205', color: 'white', fontSize: '15px' }} /><button onClick={startResearch} disabled={loading} style={{ padding: '0 32px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>{loading ? "Agent Thinking..." : "Start Research"}</button></div>
            </section>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {products.filter(p => p.status === "RESEARCHING").map((p, i) => (<div key={i} style={cardStyle}><div style={{ background: '#064e3b', color: '#10b981', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', width: 'fit-content', marginBottom: '16px' }}>{p.winningScore}% WIN SCORE</div><h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>{p.name}</h4><div style={{ display: 'flex', gap: '8px' }}><button style={btnOutlineStyle}>View Brief</button><button onClick={() => onShortlist(p.id)} style={btnPrimaryStyle}>Shortlist Product</button></div></div>))}
              {products.filter(p => p.status === "RESEARCHING").length === 0 && !loading && <div style={emptyStateStyle}>No active research results.</div>}
            </div></>
        )}
        {activeTab === "SHORTLISTED" && (
          <><h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '32px' }}>Shortlisted Products</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {products.filter(p => p.status === "SHORTLISTED").map((p, i) => (<div key={i} style={cardStyle}><div style={{ color: '#6366f1', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>READY FOR SOURCING</div><h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>{p.name}</h4><button onClick={() => onDiscoverSuppliers(p.id)} style={btnPrimaryStyle}>Discover Suppliers</button></div>))}
              {products.filter(p => p.status === "SHORTLISTED").length === 0 && <div style={emptyStateStyle}>No products shortlisted yet.</div>}
            </div></>
        )}
        {activeTab === "SUPPLIERS" && (
          <><h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '32px' }}>Verified Suppliers</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {suppliers.map((s, i) => (<div key={i} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ fontWeight: '600', fontSize: '16px' }}>{s.name}</div><div style={{ fontSize: '12px', color: '#94a3b8' }}>Product: {s.product?.name} | Sourcing Price: ₹{s.price}</div></div><div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><div style={{ color: '#eab308', fontWeight: 'bold' }}>{s.rating} ★</div><button onClick={() => onNegotiate(s)} style={btnPrimaryStyle}>Launch Negotiation</button></div></div>))}
              {suppliers.length === 0 && <div style={emptyStateStyle}>No suppliers discovered yet.</div>}
            </div></>
        )}
        {activeTab === "NEGOTIATIONS" && (
          <><h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '32px' }}>Negotiations</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {negotiations.map((n, i) => (<div key={i} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}><div style={{ width: '40px', height: '40px', background: '#1A1A2F', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={20} color="#6366f1" /></div><div><div style={{ fontWeight: '600' }}>{n.supplier?.name}</div><div style={{ fontSize: '12px', color: '#6366f1' }}>{n.status}</div></div></div><button onClick={() => setSelectedNegotiation(n)} style={btnOutlineStyle}>View Thread</button></div>))}
              {negotiations.length === 0 && <div style={emptyStateStyle}>No active negotiations.</div>}
            </div></>
        )}
        {activeTab === "REPORTS" && (<><h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '32px' }}>Agent Reports</h2><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>{reports.map((r, i) => (<div key={i} style={cardStyle}><div style={{ color: '#6366f1', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>{r.type} REPORT</div><h3 style={{ marginBottom: '12px' }}>{r.title}</h3><p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5' }}>{r.content}</p></div>))}{reports.length === 0 && <div style={emptyStateStyle}>No reports found.</div>}</div></>)}
        {activeTab === "LIVE_INTEL" && (<><h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '32px' }}>Live Intelligence</h2><div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>{tasks.map((t, i) => (<div key={i} style={{ ...cardStyle, borderLeft: '4px solid #6366f1' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}><Cpu size={16} color="#6366f1" /> {t.agentName}</div><div style={{ fontSize: '12px', background: '#1e293b', padding: '2px 8px', borderRadius: '4px' }}>{t.status}</div></div><div style={{ background: '#11111A', height: '6px', borderRadius: '3px', marginBottom: '12px' }}><div style={{ background: '#6366f1', height: '100%', borderRadius: '3px', width: `${t.progress}%` }}></div></div><p style={{ fontSize: '13px', color: '#94a3b8' }}>{t.details}</p></div>))}{tasks.length === 0 && <div style={emptyStateStyle}>No active agents running.</div>}</div></>)}
        {activeTab === "AUDIT_LOGS" && (<><h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '32px' }}>Audit Logs</h2><div style={{ background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '16px', overflow: 'hidden' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ background: '#11111A', textAlign: 'left', fontSize: '12px', color: '#475569' }}><th style={{ padding: '16px' }}>ACTION</th><th style={{ padding: '16px' }}>ENTITY</th><th style={{ padding: '16px' }}>TIMESTAMP</th></tr></thead><tbody>{logs.map((l, i) => (<tr key={i} style={{ borderBottom: '1px solid #1e293b', fontSize: '14px' }}><td style={{ padding: '16px', fontWeight: '600', color: '#6366f1' }}>{l.action}</td><td style={{ padding: '16px' }}>{l.entity}</td><td style={{ padding: '16px', color: '#475569' }}>{new Date(l.timestamp).toLocaleString()}</td></tr>))}</tbody></table>{logs.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#475569' }}>No history.</div>}</div></>)}
        {activeTab === "OVERVIEW" && (<><h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '32px' }}>Brand Overview</h2><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}><div style={statCardStyle}><div style={statLabelStyle}>TOTAL PRODUCTS</div><div style={statValStyle}>{products.length}</div></div><div style={statCardStyle}><div style={statLabelStyle}>ACTIVE AGENTS</div><div style={{ ...statValStyle, color: '#6366f1' }}>{negotiations.length + (loading ? 1 : 0)}</div></div><div style={statCardStyle}><div style={statLabelStyle}>AVG ROI</div><div style={{ ...statValStyle, color: '#10b981' }}>3.2x</div></div></div></>)}
      </main>
      {selectedNegotiation && (<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}><div style={{ width: '600px', height: '600px', background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '24px', display: 'flex', flexDirection: 'column' }}><header style={{ padding: '24px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ fontWeight: '700', fontSize: '18px' }}>{selectedNegotiation.supplier.name}</div><div style={{ fontSize: '12px', color: '#6366f1' }}>{selectedNegotiation.status}</div></div><X size={24} style={{ cursor: 'pointer' }} onClick={() => setSelectedNegotiation(null)} /></header><div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>{JSON.parse(selectedNegotiation.history).map((m, i) => (<div key={i} style={{ alignSelf: m.role === 'agent' ? 'flex-end' : 'flex-start', maxWidth: '80%', background: m.role === 'agent' ? '#6366f1' : '#1e293b', padding: '16px', borderRadius: '16px', fontSize: '14px', lineHeight: '1.5' }}><strong>{m.role === 'agent' ? 'Wingman' : 'Supplier'}:</strong><br />{m.content}</div>))}</div></div></div>)}
      <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>{!isChatOpen ? (<button onClick={() => setIsChatOpen(true)} style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#6366f1', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageCircle size={28} /></button>) : (<div style={{ width: '380px', height: '500px', background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 12px 64px rgba(0,0,0,0.5)' }}><header style={{ padding: '16px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#11111A', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%' }}></div><span style={{ fontWeight: '600' }}>Assistant</span></div><X size={20} style={{ cursor: 'pointer' }} onClick={() => setIsChatOpen(false)} /></header><div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>{chatHistory.map((m, i) => (<div key={i} style={{ maxWidth: '80%', padding: '12px', borderRadius: '12px', fontSize: '14px', lineHeight: '1.4', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', background: m.role === 'user' ? '#6366f1' : '#1A1A2F', color: 'white' }}>{m.text}</div>))}<div ref={chatEndRef} /></div><div style={{ padding: '16px', borderTop: '1px solid #1e293b', display: 'flex', gap: '8px' }}><input value={chatMessage} onChange={e => setChatMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendChatMessage()} placeholder="Ask me anything..." style={{ flex: 1, background: '#020205', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: 'white' }} /><button onClick={sendChatMessage} style={{ background: '#6366f1', border: 'none', borderRadius: '8px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}><Send size={18} /></button></div></div>)}</div>
    </div>
  );
}
const cardStyle = { background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' };
const btnPrimaryStyle = { padding: '10px 16px', background: '#6366f1', border: 'none', color: 'white', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' };
const btnOutlineStyle = { padding: '10px 16px', background: 'transparent', border: '1px solid #334155', color: 'white', borderRadius: '8px', cursor: 'pointer' };
const statCardStyle = { background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' };
const statLabelStyle = { color: '#475569', fontSize: '12px' };
const statValStyle = { fontSize: '32px', fontWeight: '700', marginTop: '8px' };
const emptyStateStyle = { gridColumn: '1 / -1', textAlign: 'center', padding: '80px', border: '2px dashed #1e293b', borderRadius: '16px', color: '#475569' };
export default App;
