import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, LayoutDashboard, Search, List, Users, 
  MessageSquare, CheckCircle, Activity, History, 
  BarChart3, FileText, Zap, Rocket, TrendingUp, Package, 
  CheckCircle2, AlertTriangle, X, Mail, Cpu, ClipboardList
} from 'lucide-react';

const API_BASE = "https://weaveos-backend.vercel.app";

const SidebarItem = ({ icon: Icon, label, active = false, onClick }) => (
  <div onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', 
    borderRadius: '8px', cursor: 'pointer', marginBottom: '4px',
    backgroundColor: active ? '#EEF2FF' : 'transparent', color: active ? '#4f46e5' : '#64748b',
    transition: 'all 0.2s', userSelect: 'none'
  }}>
    <Icon size={18} />
    <span style={{ fontSize: '14px', fontWeight: active ? '600' : '400' }}>{label}</span>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ prods: [], sups: [], negs: [], reps: [], logs: [], intel: [], orders: [] });
  const [tenantId] = useState("hackathon_demo");

  useEffect(() => { refresh(); }, [activeTab]);

  const refresh = async () => {
    try {
      const endpoints = ['products', 'suppliers', 'negotiations', 'reports', 'logs', 'intelligence', 'orders'];
      const res = await Promise.all(endpoints.map(e => fetch(`${API_BASE}/${e}/${tenantId}`).then(r => r.json())));
      setData({ prods: res[0], sups: res[1], negs: res[2], reps: res[3], logs: res[4], intel: res[5], orders: res[6] });
    } catch (e) {}
  };

  const seed = async () => {
    setLoading(true);
    await fetch(`${API_BASE}/seed", {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tenantId })
    });
    await refresh();
    setLoading(false);
    alert("Environment Populated.");
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
    <div style={{ backgroundColor: '#ffffff', color: '#020617', minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      <aside style={{ width: '240px', borderRight: '1px solid #f1f5f9', padding: '24px 16px', position: 'fixed', height: '100vh', background: '#f8fafc', zIndex: 10 }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}><ShieldCheck color="#4f46e5" fill="#4f46e5" size={24} /> WeaveOS</h1>
        <SidebarItem onClick={() => setActiveTab("OVERVIEW")} icon={LayoutDashboard} label="Overview" active={activeTab === "OVERVIEW"} />
        <div style={navLabelStyle}>SOURCING</div>
        <SidebarItem onClick={() => setActiveTab("DISCOVERY")} icon={Search} label="Discovery" active={activeTab === "DISCOVERY"} />
        <SidebarItem onClick={() => setActiveTab("SHORTLISTED")} icon={List} label="Shortlisted" active={activeTab === "SHORTLISTED"} />
        <SidebarItem onClick={() => setActiveTab("SUPPLIERS")} icon={Users} label="Suppliers" active={activeTab === "SUPPLIERS"} />
        <SidebarItem onClick={() => setActiveTab("NEGOTIATIONS")} icon={MessageSquare} label="Negotiations" active={activeTab === "NEGOTIATIONS"} />
        <SidebarItem onClick={() => setActiveTab("APPROVED")} icon={CheckCircle} label="Approved" active={activeTab === "APPROVED"} />
        <div style={navLabelStyle}>ORDERS</div>
        <SidebarItem onClick={() => setActiveTab("ORDERS_ACTIVE")} icon={Package} label="Active" active={activeTab === "ORDERS_ACTIVE"} />
        <SidebarItem onClick={() => setActiveTab("ORDERS_HISTORY")} icon={History} label="History" active={activeTab === "ORDERS_HISTORY"} />
        <div style={navLabelStyle}>INTELLIGENCE</div>
        <SidebarItem onClick={() => setActiveTab("CROSS_AGENT")} icon={BarChart3} label="Cross-Agent" active={activeTab === "CROSS_AGENT"} />
        <SidebarItem onClick={() => setActiveTab("REPORTS")} icon={FileText} label="Reports" active={activeTab === "REPORTS"} />
        <button onClick={seed} style={{ marginTop: 'auto', padding: '10px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Seed Demo</button>
      </aside>
      <main style={{ flex: 1, marginLeft: '240px', padding: '32px 48px', backgroundColor: '#fcfcfd' }}>
        {activeTab === "OVERVIEW" && (<>
          <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Brand Overview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '32px' }}>
            <div style={statCardStyle}><div style={statLabelStyle}>TOTAL GMV</div><div style={statValStyle}>₹4.2 Cr</div><div style={statSubStyle}>+18.4% YoY</div></div>
            <div style={statCardStyle}><div style={statLabelStyle}>AI SAVINGS</div><div style={{...statValStyle, color: '#4f46e5'}}>₹2.4L</div><div style={statSubStyle}>Negotiation impact</div></div>
            <div style={statCardStyle}><div style={statLabelStyle}>ACTIVE ORDERS</div><div style={statValStyle}>{data.orders.length}</div><div style={statSubStyle}>Processing now</div></div>
            <div style={statCardStyle}><div style={statLabelStyle}>TRUE ROAS</div><div style={{...statValStyle, color: '#10b981'}}>3.14x</div><div style={statSubStyle}>Profit optimized</div></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '32px' }}>
             <div style={whiteCardStyle}><div style={cardHeaderStyle}>Intelligent Alerts</div>{data.intel.slice(0, 3).map((a, i) => (<div key={i} style={alertItemStyle}><CheckCircle2 color="#10b981" size={20} /><div><div style={{fontWeight:'600'}}>{a.title}</div><div style={{fontSize:'12px', color:'#64748b'}}>{a.content}</div></div></div>))}</div>
             <div style={whiteCardStyle}><div style={cardHeaderStyle}>Recent Logs</div>{data.logs.slice(0, 5).map((l, i) => (<div key={i} style={{marginBottom:'12px', paddingLeft:'12px', borderLeft:'2px solid #f1f5f9'}}><div style={{fontSize:'12px', fontWeight:'600'}}>{l.action}</div><div style={{fontSize:'11px', color:'#94a3b8'}}>{l.entity}</div></div>))}</div>
          </div></>)}
        {activeTab === "CROSS_AGENT" && (<>
          <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Cross-Agent Intelligence</h2>
          <div style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '24px', marginTop: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '40px' }}><div style={{ padding: '6px 16px', background: '#f0fdf4', color: '#10b981', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>Sourcing Agent</div><div style={{ height: '1px', width: '80px', background: '#e2e8f0' }}></div><div style={{ fontSize: '11px', color: '#94a3b8' }}>data flows</div><div style={{ height: '1px', width: '80px', background: '#e2e8f0' }}></div><div style={{ padding: '6px 16px', background: '#eff6ff', color: '#3b82f6', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>Marketing Agent</div></div>
            {data.intel.map((a, i) => (<div key={i} style={alertCardStyle}><div style={iconCircleStyle(a.type)}>{a.type === 'SUCCESS' ? <CheckCircle2 color="#10b981" /> : <AlertTriangle color="#f59e0b" />}</div><div style={{flex:1}}><div style={{fontWeight:'700'}}>{a.title}</div><p style={{fontSize:'14px', color:'#64748b'}}>{a.content}</p></div><button style={btnEmeraldStyle}>Act on this</button></div>))}</div></>)}
        {activeTab === "ORDERS_ACTIVE" && (<>
          <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Active Orders</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '32px' }}>{['Confirmed', 'In Production', 'Shipped', 'Delivered'].map(status => (<div key={status}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '13px', fontWeight: '600' }}><span style={{ background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px' }}>{status}</span><span style={{ color: '#94a3b8' }}>{data.orders.filter(o => o.status.replace('_', ' ').toLowerCase() === status.toLowerCase()).length}</span></div>{data.orders.filter(o => o.status.replace('_', ' ').toLowerCase() === status.toLowerCase()).map((o, j) => (<div key={j} style={{ ...whiteCardStyle, padding: '20px', marginBottom: '16px' }}><div style={{ fontWeight: '600', marginBottom: '4px' }}>{o.productName}</div><div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>{o.supplier.name}</div><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}><span style={{ color: '#64748b' }}>{o.units} units</span><span style={{ fontWeight: '700' }}>₹{o.totalAmount.toLocaleString()}</span></div>{o.eta && <div style={{ fontSize: '11px', color: '#4f46e5', marginTop: '12px', fontWeight: '500' }}>ETA: {o.eta}</div>}</div>))}{data.orders.filter(o => o.status.replace('_', ' ').toLowerCase() === status.toLowerCase()).length === 0 && (<div style={{ padding: '20px', border: '1px dashed #e2e8f0', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>No orders</div>)}</div>))}</div></>)}
        {activeTab === "APPROVED" && (<>
          <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Approved Suppliers</h2>
          <div style={{ marginTop: '32px' }}>{data.sups.filter(s => s.status === "APPROVED").map((s, i) => (<div key={i} style={{ ...whiteCardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}><div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}><div style={scoreCircleStyle}>75</div><div><div style={{ fontWeight: '700', fontSize: '18px' }}>{s.name}</div><div style={{ fontSize: '14px', color: '#94a3b8' }}>Approved • {s.product?.name}</div></div></div><div style={{ textAlign: 'right' }}><div style={{ fontSize: '12px', color: '#94a3b8' }}>Agreed Price</div><div style={{ fontSize: '16px', fontWeight: '700' }}>₹{s.price}/unit</div><button style={{ ...btnEmeraldStyle, marginTop: '12px' }}>Place Order</button></div></div>))}</div></>)}
        {activeTab === "DISCOVERY" && (<>
          <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Discovery</h2>
          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}><input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Organic Spices..." style={{ flex: 1, padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /><button onClick={onResearch} style={{ background: '#0f172a', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px' }}>Start Research</button></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginTop: '32px' }}>{data.prods.filter(p => p.status === "RESEARCHING").map((p, i) => (<div key={i} style={whiteCardStyle}><div style={winBadgeStyle}>{p.winningScore}</div><h4 style={{fontWeight:'700'}}>{p.name}</h4><button style={btnDarkStyle}>Shortlist</button></div>))}</div></>)}
      </main>
    </div>
  );
}
const navLabelStyle = { margin: '24px 0 8px', padding: '0 16px', fontSize: '10px', color: '#94a3b8', fontWeight: '800', letterSpacing: '0.05em' };
const statCardStyle = { background: 'white', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '24px' };
const statLabelStyle = { color: '#64748b', fontSize: '11px', fontWeight: '600' };
const statValStyle = { fontSize: '24px', fontWeight: '800', marginTop: '8px' };
const statSubStyle = { fontSize: '11px', color: '#94a3b8', marginTop: '4px' };
const whiteCardStyle = { background: 'white', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '24px', marginBottom: '16px' };
const cardHeaderStyle = { fontSize: '14px', fontWeight: '700', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px' };
const alertItemStyle = { display: 'flex', gap: '12px', padding: '12px 0' };
const btnDarkStyle = { background: '#0f172a', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' };
const btnEmeraldStyle = { background: '#059669', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' };
const winBadgeStyle = { width: '40px', height: '40px', border: '2px solid #10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#10b981', marginBottom: '16px' };
const thStyle = { padding: '16px 24px' };
const tdStyle = { padding: '16px 24px' };
const alertCardStyle = { display: 'flex', gap: '20px', padding: '24px', border: '1px solid #f1f5f9', borderRadius: '24px', marginBottom: '16px', alignItems: 'center' };
const iconCircleStyle = (t) => ({ width: '48px', height: '48px', background: t === 'SUCCESS' ? '#f0fdf4' : '#fffbeb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' });
const scoreCircleStyle = { width: '48px', height: '48px', border: '3px solid #10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#10b981' };
const btnLightStyle = { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px', fontWeight: '500' };
export default App;
