import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, LayoutDashboard, Search, List, Users, 
  MessageSquare, CheckCircle, Activity, History, 
  BarChart3, FileText, Send, Sparkles, TrendingUp, Rocket,
  AlertCircle, X, MessageCircle, Zap, Cpu, ClipboardList
} from 'lucide-react';

const API_BASE = "https://weaveos-backend.vercel.app";

const SidebarItem = ({ icon: Icon, label, active = false, onClick }) => (
  <div onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px',
    borderRadius: '8px', cursor: 'pointer', marginBottom: '4px',
    backgroundColor: active ? '#1A1A2F' : 'transparent', color: active ? '#6366f1' : '#94a3b8',
    transition: 'all 0.2s', userSelect: 'none'
  }}>
    <Icon size={18} />
    <span style={{ fontSize: '14px', fontWeight: active ? '600' : '400' }}>{label}</span>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState("DISCOVERY");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ prods: [], sups: [], negs: [], reps: [], logs: [], tasks: [] });
  const [selectedNeg, setSelectedNeg] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [chatHistory, setChatHistory] = useState([{ role: 'assistant', text: "Ready to orchestrate. What's our next move?" }]);
  const chatEndRef = useRef(null);
  const [tenantId] = useState("hackathon_demo");

  useEffect(() => { refresh(); }, [activeTab]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

  const refresh = async () => {
    try {
      const endpoints = ['products', 'suppliers', 'negotiations', 'reports', 'logs', 'tasks'];
      const res = await Promise.all(endpoints.map(e => fetch(`${API_BASE}/${e}/${tenantId}`).then(r => r.json())));
      setData({ prods: res[0], sups: res[1], negs: res[2], reps: res[3], logs: res[4], tasks: res[5] });
    } catch (e) {}
  };

  const onResearch = async () => {
    setLoading(true);
    await fetch(`${API_BASE}/research`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ tenant_id: tenantId, keyword })});
    await refresh();
    setLoading(false);
  };

  const onShortlist = async (id) => { await fetch(`${API_BASE}/shortlist/${id}`, { method: 'POST' }); await refresh(); setActiveTab("SHORTLISTED"); };
  const onDiscoverSups = async (id) => { await fetch(`${API_BASE}/discover-suppliers/${id}`, { method: 'POST' }); await refresh(); setActiveTab("SUPPLIERS"); };
  const onNegotiate = async (s) => { 
    await fetch(`${API_BASE}/negotiate`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ tenant_id: tenantId, supplier_id: s.id, supplier_email: "sales@partner.in", target_price: 1100 })});
    await refresh(); setActiveTab("NEGOTIATIONS");
  };

  const sendChat = async () => {
    if (!chatMsg) return;
    const userTxt = chatMsg; setChatHistory([...chatHistory, { role: 'user', text: userTxt }]); setChatMsg("");
    try {
      const res = await fetch(`${API_BASE}/chat`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ tenant_id: tenantId, message: userTxt })});
      const d = await res.json(); setChatHistory(prev => [...prev, { role: 'assistant', text: d.reply }]);
    } catch (e) {}
  };

  return (
    <div style={{ backgroundColor: '#020205', color: '#f8fafc', minHeight: '100vh', display: 'flex', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <aside style={{ width: '260px', borderRight: '1px solid #1e293b', padding: '24px 16px', position: 'fixed', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}><ShieldCheck color="#6366f1" /> D2C Wingman</h1>
        <SidebarItem onClick={() => setActiveTab("OVERVIEW")} icon={LayoutDashboard} label="Overview" active={activeTab === "OVERVIEW"} />
        <SidebarItem onClick={() => setActiveTab("DISCOVERY")} icon={Search} label="Discovery" active={activeTab === "DISCOVERY"} />
        <SidebarItem onClick={() => setActiveTab("SHORTLISTED")} icon={List} label="Shortlisted" active={activeTab === "SHORTLISTED"} />
        <SidebarItem onClick={() => setActiveTab("SUPPLIERS")} icon={Users} label="Suppliers" active={activeTab === "SUPPLIERS"} />
        <SidebarItem onClick={() => setActiveTab("NEGOTIATIONS")} icon={MessageSquare} label="Negotiations" active={activeTab === "NEGOTIATIONS"} />
        <SidebarItem onClick={() => setActiveTab("REPORTS")} icon={FileText} label="Reports" active={activeTab === "REPORTS"} />
        <div style={{ margin: '20px 0 10px', padding: '0 16px', fontSize: '11px', color: '#475569', fontWeight: '600' }}>MONITORING</div>
        <SidebarItem onClick={() => setActiveTab("LIVE")} icon={Activity} label="Live Intel" active={activeTab === "LIVE"} />
        <SidebarItem onClick={() => setActiveTab("LOGS")} icon={History} label="Audit Logs" active={activeTab === "LOGS"} />
        <button onClick={async () => { await fetch(`${API_BASE}/seed`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({tenant_id:tenantId})}); refresh(); alert("Demo Seeded!"); }} style={{ marginTop: 'auto', padding: '12px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={14} color="#eab308" /> Prepare Demo Data</button>
      </aside>

      <main style={{ flex: 1, marginLeft: '260px', padding: '40px' }}>
        {activeTab === "DISCOVERY" && (
          <><h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '32px' }}>Discovery</h2>
          <div style={{ background: 'linear-gradient(145deg, #0a0a14 0%, #11111f 100%)', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px', marginBottom: '40px' }}>
            <div style={{ display: 'flex', gap: '12px' }}><input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Organic Coffee Beans..." style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid #334155', background: '#020205', color: 'white' }} /><button onClick={onResearch} disabled={loading} style={{ padding: '0 32px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>{loading ? "Agent Thinking..." : "Start Research"}</button></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {data.prods.filter(p => p.status === "RESEARCHING").map((p, i) => (
              <div key={i} style={cardStyle}><div style={badgeStyle}>{p.winningScore}% WIN SCORE</div><h4 style={{ fontSize: '18px', marginBottom: '20px' }}>{p.name}</h4><button onClick={() => onShortlist(p.id)} style={btnPrimaryStyle}>Shortlist</button></div>
            ))}
          </div></>
        )}
        {activeTab === "SHORTLISTED" && (
          <><h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '32px' }}>Shortlisted</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {data.prods.filter(p => p.status === "SHORTLISTED").map((p, i) => (<div key={i} style={cardStyle}><h4>{p.name}</h4><button onClick={() => onDiscoverSups(p.id)} style={{ ...btnPrimaryStyle, marginTop: '16px' }}>Discover Suppliers</button></div>))}
          </div></>
        )}
        {activeTab === "SUPPLIERS" && (
          <><h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '32px' }}>Suppliers</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.sups.map((s, i) => (<div key={i} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ fontWeight: '600' }}>{s.name}</div><div style={{ color: '#94a3b8' }}>For: {s.product?.name}</div></div><button onClick={() => onNegotiate(s)} style={btnPrimaryStyle}>Negotiate</button></div>))}
          </div></>
        )}
        {activeTab === "NEGOTIATIONS" && (
          <><h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '32px' }}>Negotiations</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.negs.map((n, i) => (<div key={i} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between' }}><div><div style={{ fontWeight: '600' }}>{n.supplier?.name}</div><div style={{ color: '#6366f1' }}>{n.status}</div></div><button onClick={() => setSelectedNeg(n)} style={btnOutlineStyle}>View Thread</button></div>))}
          </div></>
        )}
        {activeTab === "REPORTS" && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {data.reps.map((r, i) => (<div key={i} style={cardStyle}><div style={{ color: '#6366f1', fontSize: '11px', fontWeight: 'bold' }}>{r.type} REPORT</div><h4>{r.title}</h4><p style={{ color: '#94a3b8', marginTop: '12px' }}>{r.content}</p></div>))}
          </div>
        )}
        {activeTab === "LIVE" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.tasks.map((t, i) => (<div key={i} style={cardStyle}><div style={{ display: 'flex', justifyContent: 'space-between' }}><b>{t.agentName}</b><div style={{ fontSize: '12px', background: '#1e293b', padding: '2px 8px', borderRadius: '4px' }}>{t.status}</div></div><div style={{ background: '#11111A', height: '6px', borderRadius: '3px', marginTop: '12px' }}><div style={{ background: '#6366f1', height: '100%', width: `${t.progress}%`, borderRadius: '3px' }}></div></div><p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '12px' }}>{t.details}</p></div>))}
          </div>
        )}
        {activeTab === "LOGS" && (
          <div style={{ background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '16px', overflow: 'hidden' }}>
            <table style={{ width: '100%', textAlign: 'left' }}>
              <thead style={{ background: '#11111A', fontSize: '12px', color: '#475569' }}><tr><th style={{ padding: '16px' }}>ACTION</th><th style={{ padding: '16px' }}>ENTITY</th><th style={{ padding: '16px' }}>TIME</th></tr></thead>
              <tbody>{data.logs.map((l, i) => (<tr key={i} style={{ borderTop: '1px solid #1e293b', fontSize: '14px' }}><td style={{ padding: '16px', fontWeight: '600' }}>{l.action}</td><td style={{ padding: '16px' }}>{l.entity}</td><td style={{ padding: '16px', color: '#475569' }}>{new Date(l.timestamp).toLocaleTimeString()}</td></tr>))}</tbody>
            </table>
          </div>
        )}
        {activeTab === "OVERVIEW" && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
            <div style={cardStyle}><div style={statLabelStyle}>PRODUCTS</div><div style={statValStyle}>{data.prods.length}</div></div>
            <div style={cardStyle}><div style={statLabelStyle}>ACTIVE AGENTS</div><div style={{ ...statValStyle, color: '#6366f1' }}>{data.negs.length + (loading ? 1 : 0)}</div></div>
            <div style={cardStyle}><div style={statLabelStyle}>AVG ROI</div><div style={{ ...statValStyle, color: '#10b981' }}>3.2x</div></div>
          </div>
        )}
      </main>

      {selectedNeg && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ width: '600px', height: '600px', background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '24px', display: 'flex', flexDirection: 'column' }}>
            <header style={{ padding: '24px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><div style={{ fontWeight: '700', fontSize: '18px' }}>{selectedNeg.supplier.name}</div><div style={{ fontSize: '12px', color: '#6366f1' }}>{selectedNeg.status}</div></div>
              <X size={24} style={{ cursor: 'pointer' }} onClick={() => setSelectedNeg(null)} />
            </header>
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {JSON.parse(selectedNeg.history).map((m, i) => (<div key={i} style={{ alignSelf: m.role === 'agent' ? 'flex-end' : 'flex-start', maxWidth: '80%', background: m.role === 'agent' ? '#6366f1' : '#1e293b', padding: '16px', borderRadius: '16px', fontSize: '14px' }}><b>{m.role === 'agent' ? 'Wingman' : 'Supplier'}:</b><br />{m.content}</div>))}
            </div>
          </div>
        </div>
      )}

      <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>
        {!isChatOpen ? (<button onClick={() => setIsChatOpen(true)} style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#6366f1', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageCircle size={28} /></button>) : (
          <div style={{ width: '380px', height: '500px', background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
            <header style={{ padding: '16px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#11111A', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}><b>Assistant</b><X size={20} style={{ cursor: 'pointer' }} onClick={() => setIsChatOpen(false)} /></header>
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>{chatHistory.map((m, i) => (<div key={i} style={{ maxWidth: '80%', padding: '12px', borderRadius: '12px', fontSize: '14px', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', background: m.role === 'user' ? '#6366f1' : '#1A1A2F' }}>{m.text}</div>))}<div ref={chatEndRef} /></div>
            <div style={{ padding: '16px', borderTop: '1px solid #1e293b', display: 'flex', gap: '8px' }}><input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendChat()} placeholder="Ask me..." style={{ flex: 1, background: '#020205', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: 'white' }} /><button onClick={sendChat} style={{ background: '#6366f1', border: 'none', borderRadius: '8px', width: '40px', color: 'white', cursor: 'pointer' }}><Send size={18} /></button></div>
          </div>
        )}
      </div>
    </div>
  );
}
const cardStyle = { background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' };
const badgeStyle = { background: '#064e3b', color: '#10b981', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', width: 'fit-content', marginBottom: '16px' };
const btnPrimaryStyle = { padding: '10px 16px', background: '#6366f1', border: 'none', color: 'white', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' };
const btnOutlineStyle = { padding: '10px 16px', background: 'transparent', border: '1px solid #334155', color: 'white', borderRadius: '8px', cursor: 'pointer' };
const statLabelStyle = { color: '#475569', fontSize: '12px' };
const statValStyle = { fontSize: '32px', fontWeight: '700', marginTop: '8px' };
export default App;
