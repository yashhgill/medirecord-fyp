import { useState, useRef } from "react";

// ILMU by YTL AI Labs — OpenAI-compatible API
// Endpoint: https://api.ilmu.ai/v1/chat/completions
// Models: nemo-super (clinical, reasoning) | ilmu-nemo-nano (fast, kiosk)
// Sign up & get your key at: https://console.ilmu.ai
const ILMU_BASE  = "https://api.ilmu.ai/v1/chat/completions";
const ILMU_KEY   = "YOUR_ILMU_API_KEY"; // replace with sk-... from console.ilmu.ai
const MODEL_SMART = "nemo-super";       // doctor summaries + clinical AI
const MODEL_FAST  = "ilmu-nemo-nano";   // kiosk chat + admin (lower cost)

async function callILMU(systemPrompt, messages, fast = false) {
  const res = await fetch(ILMU_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ILMU_KEY}`,
    },
    body: JSON.stringify({
      model: fast ? MODEL_FAST : MODEL_SMART,
      max_tokens: 900,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error?.message || `ILMU API ralat ${res.status}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "Tiada respons.";
}

const PATIENTS = {
  "IC-001234": {
    id: "IC-001234", name: "Ahmad Razif bin Ismail", dob: "1985-03-12", age: 39,
    blood: "O+", gender: "Lelaki", allergies: ["Penicillin","Ibuprofen"],
    phone: "012-3456789", email: "ahmad.razif@gmail.com",
    visits: [
      { date:"2025-11-20", doctor:"Dr. Sarah Lim", dept:"General", diagnosis:"Bronkitis akut", treatment:"Amoxicillin 500mg 3x sehari", notes:"Batuk produktif 5 hari. Dada bersih. Follow-up 1 minggu.", paid:true, amount:85 },
      { date:"2025-08-14", doctor:"Dr. Ahmad Faiz", dept:"Kardiologi", diagnosis:"Hipertensi (terkawal)", treatment:"Amlodipine 5mg sehari", notes:"BP 135/88. Berat 78kg. Kurangkan garam.", paid:true, amount:120 },
    ],
    appointments: [
      { date:"2026-05-22", time:"10:30", doctor:"Dr. Ahmad Faiz", dept:"Kardiologi", reason:"Semakan BP rutin" },
    ],
    medications: ["Amlodipine 5mg (sehari)","Aspirin 100mg (sehari)"],
    outstanding: 0,
  },
  "IC-005678": {
    id: "IC-005678", name: "Nurul Ain binti Hassan", dob: "1992-07-28", age: 32,
    blood: "A+", gender: "Perempuan", allergies: ["Sulfonamides"],
    phone: "016-7891234", email: "nurul.ain@yahoo.com",
    visits: [
      { date:"2026-04-10", doctor:"Dr. Priya Nair", dept:"Obstetrik", diagnosis:"Pranatal 28 minggu", treatment:"Asid folik + zat besi diteruskan", notes:"Pertumbuhan bayi normal. Fundal 28cm.", paid:true, amount:150 },
    ],
    appointments: [
      { date:"2026-05-25", time:"11:00", doctor:"Dr. Priya Nair", dept:"Obstetrik", reason:"Imbasan pranatal 32 minggu" },
    ],
    medications: ["Asid folik 5mg (sehari)","Ferrous sulphate 200mg (sehari)"],
    outstanding: 0,
  },
  "IC-009012": {
    id: "IC-009012", name: "Tan Wei Liang", dob: "1968-11-05", age: 57,
    blood: "B+", gender: "Lelaki", allergies: ["Codeine"],
    phone: "019-2345678", email: "twl68@hotmail.com",
    visits: [
      { date:"2026-05-01", doctor:"Dr. Ahmad Faiz", dept:"Kardiologi", diagnosis:"Sakit dada – dalam siasatan", treatment:"ECG done, rujuk stress test", notes:"Sesak dada semasa bersenam x 2 minggu. ECG: perubahan ST. Stress echo mendesak.", paid:false, amount:280 },
      { date:"2025-12-20", doctor:"Dr. Ahmad Faiz", dept:"Kardiologi", diagnosis:"Hiperlipidemia", treatment:"Atorvastatin 40mg malam", notes:"LDL 4.2 mmol/L. Mulakan statin.", paid:true, amount:95 },
    ],
    appointments: [
      { date:"2026-05-21", time:"14:00", doctor:"Dr. Ahmad Faiz", dept:"Kardiologi", reason:"Semakan keputusan stress test" },
    ],
    medications: ["Atorvastatin 40mg (malam)","GTN spray PRN"],
    outstanding: 280,
  },
};

const STAFF = {
  "DR001": { id:"DR001", name:"Dr. Sarah Lim",   role:"doctor", dept:"Perubatan Umum", color:"#1d4ed8" },
  "DR002": { id:"DR002", name:"Dr. Ahmad Faiz",  role:"doctor", dept:"Kardiologi",     color:"#6d28d9" },
  "NR001": { id:"NR001", name:"Jururawat Rohani", role:"nurse",  dept:"Umum",           color:"#0f766e" },
  "AD001": { id:"AD001", name:"Zainab (Admin)",   role:"admin",  dept:"Pentadbiran",    color:"#b45309" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#f4f3f0;--s:#fff;--s2:#f0ede8;--s3:#e8e5df;
    --bd:rgba(0,0,0,.07);--bd2:rgba(0,0,0,.13);
    --t:#1a1917;--m:#6b6862;--h:#a39f99;
    --blue:#1d4ed8;--bs:#eff6ff;--bb:#bfdbfe;
    --green:#059669;--gs:#ecfdf5;--gb:#a7f3d0;
    --amber:#b45309;--as:#fffbeb;--ab:#fde68a;
    --red:#dc2626;--rs:#fef2f2;--rb:#fecaca;
    --pur:#6d28d9;--ps:#f5f3ff;--pb:#ddd6fe;
    --teal:#0f766e;--ts:#f0fdfa;--tb:#99f6e4;
    --ilmu:#e8331c;--is:#fff0ee;--ib:#fdc4bc;
    --r:10px;--rl:16px;
    font-family:'Plus Jakarta Sans',sans-serif;
  }
  body{background:var(--bg);color:var(--t);font-size:14px;line-height:1.65}
  button{cursor:pointer;font-family:inherit;font-size:13px;border:none;border-radius:var(--r);transition:all .15s}
  .btn{background:var(--blue);color:#fff;padding:8px 16px;font-weight:500}
  .btn:hover{background:#1e40af} .btn:disabled{opacity:.4;cursor:not-allowed}
  .btng{background:transparent;color:var(--m);padding:7px 14px;border:1px solid var(--bd2)}
  .btng:hover{background:var(--s2)}
  .bdg{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:500}
  .bb_{background:var(--bs);color:var(--blue)} .bg_{background:var(--gs);color:var(--green)}
  .ba_{background:var(--as);color:var(--amber)} .br_{background:var(--rs);color:var(--red)}
  .bp_{background:var(--ps);color:var(--pur)}  .bt_{background:var(--ts);color:var(--teal)}
  .bi_{background:var(--is);color:var(--ilmu)}
  .card{background:var(--s);border:1px solid var(--bd);border-radius:var(--rl);padding:18px}
  .inp{width:100%;padding:9px 12px;border:1px solid var(--bd2);border-radius:var(--r);font-family:inherit;font-size:13px;background:var(--s);color:var(--t);outline:none;transition:border .15s}
  .inp:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(29,78,216,.1)}
  .tab{padding:8px 14px;background:none;border:none;border-bottom:2px solid transparent;font-size:13px;cursor:pointer;color:var(--m);font-family:inherit;transition:all .1s}
  .tab.on{border-bottom-color:var(--blue);color:var(--blue);font-weight:500}
  .mono{font-family:'JetBrains Mono',monospace}
`;

function Avatar({ name, color="#1d4ed8", size=38 }) {
  const ini = name.split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("");
  return <div style={{ width:size, height:size, borderRadius:"50%", background:color+"18", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:600, fontSize:size*.34, color, flexShrink:0 }}>{ini}</div>;
}

function PatientBanner({ p }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:14, background:"var(--s)", border:"1px solid var(--bd)", borderRadius:12, padding:"13px 17px" }}>
      <Avatar name={p.name} size={44}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:600, fontSize:15 }}>{p.name}</div>
        <div style={{ fontSize:12, color:"var(--m)" }}>IC: {p.id} · {p.dob} · Umur {p.age} · Darah: <strong>{p.blood}</strong></div>
      </div>
      <div style={{ display:"flex", gap:5, flexWrap:"wrap", justifyContent:"flex-end" }}>
        {p.allergies.map(a=><span key={a} className="bdg br_">⚠ {a}</span>)}
        {p.outstanding>0 && <span className="bdg ba_">RM{p.outstanding} tertunggak</span>}
      </div>
    </div>
  );
}

function ILMUSummary({ p }) {
  const [txt, setTxt] = useState(""); const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false); const [err, setErr] = useState("");
  async function gen() {
    setLoading(true); setErr("");
    const ctx = `Patient: ${p.name}, Age ${p.age}, Gender: ${p.gender}, Blood: ${p.blood}
Allergies: ${p.allergies.join(", ")}
Medications: ${p.medications.join(", ")}
Recent visits: ${p.visits.map(v=>`${v.date}: ${v.diagnosis} — ${v.notes}`).join(" | ")}
Upcoming: ${p.appointments.map(a=>`${a.date} ${a.time} ${a.dept}: ${a.reason}`).join("; ")}`;
    try {
      const r = await callILMU(
        "You are a clinical AI assistant in a Malaysian hospital health record system, powered by ILMU (YTL AI Labs). Provide a concise pre-consultation summary in English (3-4 sentences). Highlight: key ongoing conditions, current medications, any allergies, and one priority focus for today's visit. Be clinical and precise. No disclaimers.",
        [{ role:"user", content:`Summarise this patient before my consultation:\n${ctx}` }],
        false
      );
      setTxt(r); setDone(true);
    } catch(e){ setErr(e.message); }
    setLoading(false);
  }
  return (
    <div style={{ background:"var(--is)", border:"1px solid var(--ib)", borderRadius:12, padding:16 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontWeight:700, fontSize:14, color:"var(--ilmu)" }}>ILMU</span>
          <span style={{ fontSize:12, color:"var(--ilmu)", opacity:.65 }}>by YTL AI Labs · nemo-super</span>
          <span className="bdg bi_">Ringkasan klinikal</span>
        </div>
        {!done && <button className="btn" onClick={gen} disabled={loading} style={{ fontSize:12, padding:"5px 12px", background:"var(--ilmu)" }}>{loading?"Jana...":"Jana ringkasan"}</button>}
      </div>
      {loading && <div style={{ marginTop:10, fontSize:13, color:"var(--ilmu)" }}>ILMU sedang menganalisis rekod pesakit…</div>}
      {txt && <p style={{ marginTop:10, fontSize:13, lineHeight:1.75, color:"#5a120a" }}>{txt}</p>}
      {err && <div style={{ marginTop:10, fontSize:12, color:"var(--red)", background:"var(--rs)", padding:"8px 12px", borderRadius:8 }}>Ralat: {err} — Periksa kunci API ILMU anda (ILMU_KEY) di atas.</div>}
    </div>
  );
}

const SYS = {
  doctor: (p) => `You are a clinical AI assistant in a Malaysian hospital, powered by ILMU (YTL AI Labs). Patient: ${p.name}, Age ${p.age}, Allergies: ${p.allergies.join(", ")}, Medications: ${p.medications.join(", ")}, Recent diagnoses: ${p.visits.slice(0,2).map(v=>v.diagnosis).join(", ")}. Help with clinical questions, drug interactions, differential diagnoses, and documentation. Answer in English. Be concise. No disclaimers.`,
  nurse: (p) => `You are a nursing AI assistant in a Malaysian hospital, powered by ILMU. Patient: ${p.name}, Age ${p.age}, Allergies: ${p.allergies.join(", ")}. Help with triage, vitals interpretation, nursing notes. Be concise.`,
  admin: () => `Anda adalah pembantu pentadbiran AI untuk klinik Malaysia, dikuasakan oleh ILMU (YTL AI Labs). Bantu dengan penjadualan temujanji, pertanyaan bil, kakitangan, dan laporan. Jawab dalam Bahasa Malaysia atau Inggeris.`,
  kiosk: (p) => `Anda adalah pembantu pesakit mesra di kiosk klinik Malaysia, dikuasakan oleh ILMU oleh YTL AI Labs. Bercakap mesra dalam Bahasa Malaysia atau Inggeris (ikut bahasa pesakit). Pesakit: ${p.name}. Temujanji: ${p.appointments.map(a=>`${a.date} ${a.time} dengan ${a.doctor}`).join(", ")}. JANGAN bincang diagnosis atau ubatan secara terperinci — rujuk doktor. Bantu: persediaan temujanji, apa bawa, arah klinik. Jika perkara perubatan serius, rujuk doktor.`,
};
const SUGG = {
  doctor: ["Drug interactions with Amlodipine?","Summarise today's visit","Suggest follow-up plan"],
  nurse:  ["Flag high-risk patients","Draft triage note","Interpret vitals"],
  admin:  ["Ringkasan temujanji hari ini","Senarai bil tertunggak","Berapa pesakit hari ini?"],
  kiosk:  ["Apa yang perlu saya bawa?","Macam mana nak bersedia ujian darah?","Di mana jabatan kardiologi?"],
};

function ILMUChat({ patient, role }) {
  const [msgs, setMsgs] = useState([]); const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); const [err, setErr] = useState("");
  const endRef = useRef(null);
  const fast = role==="kiosk"||role==="admin";

  async function send(text) {
    const q = text||input; if (!q.trim()) return;
    setInput(""); setErr("");
    const hist = [...msgs, { role:"user", content:q }];
    setMsgs(hist); setLoading(true);
    try {
      const sys = SYS[role]?.(patient)||SYS.doctor(patient);
      const reply = await callILMU(sys, hist.map(m=>({ role:m.role, content:m.content })), fast);
      setMsgs([...hist, { role:"assistant", content:reply }]);
    } catch(e){ setErr(e.message); }
    setLoading(false);
    setTimeout(()=>endRef.current?.scrollIntoView({ behavior:"smooth" }), 80);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:370, background:"var(--s)", border:"1px solid var(--bd)", borderRadius:12, overflow:"hidden" }}>
      <div style={{ padding:"10px 14px", borderBottom:"1px solid var(--bd)", background:"var(--s2)", display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontWeight:700, fontSize:13, color:"var(--ilmu)" }}>ILMU</span>
        <span style={{ fontSize:11, color:"var(--m)" }}>by YTL AI Labs</span>
        <span className="bdg bi_" style={{ marginLeft:"auto" }}>{fast?"ilmu-nemo-nano":"nemo-super"}</span>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:14, display:"flex", flexDirection:"column", gap:10 }}>
        {msgs.length===0 && (
          <div>
            <p style={{ fontSize:12, color:"var(--h)", marginBottom:10 }}>Cadangan cepat:</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {(SUGG[role]||SUGG.doctor).map(s=>(
                <button key={s} onClick={()=>send(s)} style={{ fontSize:11, padding:"4px 10px", background:"var(--s2)", border:"1px solid var(--bd)", borderRadius:20, color:"var(--m)", cursor:"pointer" }}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m,i)=>(
          <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", alignItems:"flex-end", gap:6 }}>
            {m.role==="assistant" && <span style={{ fontSize:11, fontWeight:700, color:"var(--ilmu)", paddingBottom:2, whiteSpace:"nowrap" }}>ILMU</span>}
            <div style={{ maxWidth:"83%", padding:"9px 13px", borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px", background:m.role==="user"?"var(--blue)":"var(--s2)", color:m.role==="user"?"#fff":"var(--t)", fontSize:13, lineHeight:1.65, whiteSpace:"pre-wrap" }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div style={{ display:"flex", alignItems:"flex-end", gap:6 }}><span style={{ fontSize:11, fontWeight:700, color:"var(--ilmu)", paddingBottom:2 }}>ILMU</span><div style={{ padding:"9px 13px", background:"var(--s2)", borderRadius:"14px 14px 14px 4px", fontSize:13, color:"var(--m)" }}>Sedang berfikir…</div></div>}
        {err && <div style={{ fontSize:12, color:"var(--red)", padding:"8px 12px", background:"var(--rs)", borderRadius:8 }}>Ralat ILMU: {err}</div>}
        <div ref={endRef}/>
      </div>
      <div style={{ padding:"10px 14px", borderTop:"1px solid var(--bd)", display:"flex", gap:8 }}>
        <input className="inp" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder="Tanya ILMU sesuatu…" style={{ flex:1 }}/>
        <button className="btn" onClick={()=>send()} style={{ padding:"8px 14px", background:"var(--ilmu)" }}>Hantar</button>
      </div>
    </div>
  );
}

function Login({ onLogin }) {
  const [sel, setSel] = useState(null);
  const portals = [
    { id:"DR001", icon:"👨‍⚕️", label:"Dr. Sarah Lim",    sub:"Perubatan Umum", role:"Doktor",     c:"#1d4ed8" },
    { id:"DR002", icon:"🫀",   label:"Dr. Ahmad Faiz",   sub:"Kardiologi",     role:"Doktor",     c:"#6d28d9" },
    { id:"NR001", icon:"💊",   label:"Jururawat Rohani", sub:"Ward Umum",      role:"Jururawat",  c:"#0f766e" },
    { id:"AD001", icon:"🗂️",   label:"Zainab",           sub:"Pentadbiran",    role:"Admin",      c:"#b45309" },
    { id:"KIOSK", icon:"🖥️",   label:"Kiosk Pesakit",   sub:"iPad self-service",role:"Kiosk",    c:"#059669" },
  ];
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)", padding:24 }}>
      <div style={{ width:"100%", maxWidth:460 }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:48, marginBottom:10 }}>🏥</div>
          <h1 style={{ fontSize:21, fontWeight:700, marginBottom:4 }}>MediRecord Melaka</h1>
          <p style={{ fontSize:12, color:"var(--m)" }}>Sistem Rekod Kesihatan Hibrid · AI dikuasakan oleh <strong style={{ color:"var(--ilmu)" }}>ILMU</strong> (YTL AI Labs)</p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
          {portals.map(p=>(
            <button key={p.id} onClick={()=>setSel(p.id)} style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 16px", background:sel===p.id?p.c+"12":"var(--s)", border:`1.5px solid ${sel===p.id?p.c:"var(--bd)"}`, borderRadius:12, textAlign:"left", transition:"all .15s" }}>
              <span style={{ fontSize:22 }}>{p.icon}</span>
              <div><div style={{ fontWeight:500, fontSize:14 }}>{p.label}</div><div style={{ fontSize:11, color:"var(--m)" }}>{p.role} · {p.sub}</div></div>
              {sel===p.id && <span style={{ marginLeft:"auto", color:p.c, fontSize:16 }}>✓</span>}
            </button>
          ))}
        </div>
        <button className="btn" disabled={!sel} onClick={()=>onLogin(sel)} style={{ width:"100%", marginTop:18, padding:12, fontSize:14, opacity:sel?1:.4 }}>Masuk →</button>
        <div style={{ marginTop:14, padding:"10px 14px", background:"var(--is)", border:"1px solid var(--ib)", borderRadius:10, fontSize:12, color:"var(--ilmu)", display:"flex", gap:8, alignItems:"center" }}>
          <span>🇲🇾</span><span>AI 100% Malaysia — <strong>ILMU</strong> oleh YTL AI Labs + NVIDIA · Bahasa Melayu terbaik di dunia</span>
        </div>
      </div>
    </div>
  );
}

function DoctorPortal({ staff }) {
  const [patient, setPatient] = useState(null); const [tab, setTab] = useState("sejarah");
  const [nfc, setNfc] = useState(""); const [note, setNote] = useState(""); const [saved, setSaved] = useState("");
  function load(id){ const p=PATIENTS[id.trim().toUpperCase()]; setPatient(p||null); setTab("sejarah"); setNote(""); setSaved(""); }
  return (
    <div style={{ padding:24, maxWidth:880, margin:"0 auto" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
        <Avatar name={staff.name} color={staff.color} size={40}/>
        <div><div style={{ fontWeight:600 }}>{staff.name}</div><div style={{ fontSize:12, color:"var(--m)" }}>{staff.dept}</div></div>
        <span className="bdg bb_" style={{ marginLeft:"auto" }}>Portal Doktor</span>
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:18 }}>
        <input className="inp" placeholder="Ketuk NFC atau masukkan IC — cuba IC-001234 · IC-005678 · IC-009012" value={nfc} onChange={e=>setNfc(e.target.value)} onKeyDown={e=>e.key==="Enter"&&load(nfc)} style={{ flex:1 }}/>
        <button className="btn" onClick={()=>load(nfc)}>Muat</button>
        {Object.keys(PATIENTS).map(id=><button key={id} className="btng" onClick={()=>{ setNfc(id); load(id); }} style={{ fontSize:11 }}>{id}</button>)}
      </div>
      {!patient && <div style={{ textAlign:"center", padding:"60px 0", color:"var(--h)" }}><div style={{ fontSize:40, marginBottom:10 }}>📇</div><div>Ketuk kad NFC atau masukkan IC untuk memuatkan rekod pesakit</div></div>}
      {patient && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <PatientBanner p={patient}/>
          <ILMUSummary p={patient}/>
          <div style={{ display:"flex", gap:2, borderBottom:"1px solid var(--bd)" }}>
            {["sejarah","ubatan","temujanji","nota","ilmu-chat"].map(t=>(
              <button key={t} className={`tab ${tab===t?"on":""}`} onClick={()=>setTab(t)}>{t==="ilmu-chat"?"🇲🇾 ILMU Chat":t.charAt(0).toUpperCase()+t.slice(1)}</button>
            ))}
          </div>
          {tab==="sejarah" && <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {patient.visits.map((v,i)=>(
              <div key={i} className="card" style={{ padding:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <div style={{ fontWeight:600 }}>{v.date} — {v.diagnosis}</div>
                  <div style={{ display:"flex", gap:5 }}><span className="bdg bb_">{v.dept}</span><span className={`bdg ${v.paid?"bg_":"br_"}`}>{v.paid?"Dibayar":"Belum bayar"}</span></div>
                </div>
                <div style={{ fontSize:12, color:"var(--m)", marginBottom:6 }}>{v.doctor}</div>
                <div style={{ fontSize:13, marginBottom:8 }}><strong>Rawatan:</strong> {v.treatment}</div>
                <div style={{ fontSize:12, color:"var(--m)", background:"var(--s2)", padding:"8px 12px", borderRadius:8 }}>{v.notes}</div>
                <div style={{ fontSize:12, color:"var(--h)", marginTop:8 }}>Bil: RM{v.amount}</div>
              </div>
            ))}
          </div>}
          {tab==="ubatan" && <div className="card" style={{ padding:16 }}>
            <div style={{ fontWeight:600, marginBottom:12 }}>Ubatan semasa</div>
            {patient.medications.map((m,i)=><div key={i} style={{ display:"flex", gap:10, alignItems:"center", padding:"9px 12px", background:"var(--s2)", borderRadius:8, marginBottom:8 }}><span style={{ fontSize:18 }}>💊</span><span style={{ fontSize:13 }}>{m}</span></div>)}
            <div style={{ marginTop:14, padding:"10px 14px", background:"var(--rs)", border:"1px solid var(--rb)", borderRadius:8 }}>
              <div style={{ fontSize:12, fontWeight:600, color:"var(--red)", marginBottom:6 }}>⚠ Alahan</div>
              {patient.allergies.map(a=><span key={a} style={{ display:"inline-block", marginRight:6, padding:"2px 8px", background:"var(--rb)", borderRadius:20, fontSize:12, color:"var(--red)" }}>{a}</span>)}
            </div>
          </div>}
          {tab==="temujanji" && <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {patient.appointments.map((a,i)=>(
              <div key={i} className="card" style={{ padding:14, display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ textAlign:"center", width:52, flexShrink:0 }}>
                  <div style={{ fontSize:11, color:"var(--m)" }}>{a.date.slice(5).replace("-","/")}</div>
                  <div style={{ fontSize:16, fontWeight:700, color:"var(--blue)" }}>{a.time}</div>
                </div>
                <div style={{ flex:1 }}><div style={{ fontWeight:500 }}>{a.reason}</div><div style={{ fontSize:12, color:"var(--m)" }}>{a.doctor} · {a.dept}</div></div>
                <span className="bdg bg_">Akan datang</span>
              </div>
            ))}
          </div>}
          {tab==="nota" && <div className="card" style={{ padding:16 }}>
            <div style={{ fontWeight:600, marginBottom:12 }}>Nota konsultasi baru</div>
            <textarea className="inp" rows={6} placeholder="Taip nota konsultasi di sini…" value={note} onChange={e=>setNote(e.target.value)} style={{ resize:"vertical", marginBottom:10 }}/>
            <div style={{ display:"flex", gap:8 }}><button className="btn" onClick={()=>{ setSaved(note); setNote(""); }}>Simpan nota</button><button className="btng" onClick={()=>setNote("")}>Kosongkan</button></div>
            {saved && <div style={{ marginTop:14, padding:"12px 14px", background:"var(--gs)", border:"1px solid var(--gb)", borderRadius:10 }}><div style={{ fontSize:12, fontWeight:600, color:"var(--green)", marginBottom:4 }}>✓ Nota disimpan</div><p style={{ fontSize:13 }}>{saved}</p></div>}
          </div>}
          {tab==="ilmu-chat" && <ILMUChat patient={patient} role="doctor"/>}
        </div>
      )}
    </div>
  );
}

function NursePortal({ staff }) {
  const [tab, setTab] = useState("giliran"); const [selP, setSelP] = useState(null);
  const [vitals, setVitals] = useState({ td:"", nadi:"", suhu:"", spo2:"", berat:"" }); const [savedV, setSavedV] = useState(false);
  const queue = Object.values(PATIENTS).map((p,i)=>({ p, num:`A00${i+1}`, status:i===1?"dengan-doktor":"menunggu" }));
  return (
    <div style={{ padding:24, maxWidth:880, margin:"0 auto" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
        <Avatar name={staff.name} color={staff.color} size={40}/>
        <div><div style={{ fontWeight:600 }}>{staff.name}</div><div style={{ fontSize:12, color:"var(--m)" }}>{staff.dept}</div></div>
        <span className="bdg bt_" style={{ marginLeft:"auto" }}>Portal Jururawat</span>
      </div>
      <div style={{ display:"flex", gap:2, borderBottom:"1px solid var(--bd)", marginBottom:18 }}>
        {["giliran","tanda-vital","ilmu-chat"].map(t=><button key={t} className={`tab ${tab===t?"on":""}`} onClick={()=>setTab(t)}>{t==="ilmu-chat"?"🇲🇾 ILMU Chat":t==="tanda-vital"?"Tanda Vital":"Giliran"}</button>)}
      </div>
      {tab==="giliran" && <div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
          {[{l:"Menunggu",v:2,c:"var(--amber)"},{l:"Dengan doktor",v:1,c:"var(--green)"},{l:"Jumlah hari ini",v:3,c:"var(--blue)"}].map(s=>(
            <div key={s.l} style={{ background:"var(--s)", border:"1px solid var(--bd)", borderRadius:12, padding:16, textAlign:"center" }}><div style={{ fontSize:26, fontWeight:700, color:s.c }}>{s.v}</div><div style={{ fontSize:12, color:"var(--m)" }}>{s.l}</div></div>
          ))}
        </div>
        {queue.map(({p,num,status},i)=>(
          <div key={i} className="card" style={{ padding:14, display:"flex", alignItems:"center", gap:14, marginBottom:10, cursor:"pointer", border:selP?.id===p.id?"1.5px solid var(--teal)":"1px solid var(--bd)" }} onClick={()=>setSelP(p)}>
            <div className="mono" style={{ width:44, textAlign:"center", fontWeight:600, fontSize:14, color:"var(--m)" }}>{num}</div>
            <Avatar name={p.name} size={36}/>
            <div style={{ flex:1 }}><div style={{ fontWeight:500 }}>{p.name}</div><div style={{ fontSize:12, color:"var(--m)" }}>{p.id}</div></div>
            {p.allergies.length>0&&<span className="bdg br_">⚠ Alahan</span>}
            <span className={`bdg ${status==="menunggu"?"ba_":"bg_"}`}>{status}</span>
          </div>
        ))}
      </div>}
      {tab==="tanda-vital" && <div>
        <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
          {Object.values(PATIENTS).map(p=><button key={p.id} onClick={()=>{ setSelP(p); setSavedV(false); }} style={{ fontSize:12, padding:"6px 14px", background:selP?.id===p.id?"var(--teal)":"var(--s2)", border:`1px solid ${selP?.id===p.id?"var(--teal)":"var(--bd2)"}`, borderRadius:20, color:selP?.id===p.id?"#fff":"var(--m)", cursor:"pointer" }}>{p.name.split(" ")[0]}</button>)}
        </div>
        {selP && <div><PatientBanner p={selP}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:14 }}>
            {[{k:"td",l:"Tekanan darah",ph:"120/80 mmHg"},{k:"nadi",l:"Kadar nadi",ph:"76 bpm"},{k:"suhu",l:"Suhu badan",ph:"37.0 °C"},{k:"spo2",l:"SpO2",ph:"98%"},{k:"berat",l:"Berat badan",ph:"72 kg"}].map(f=>(
              <div key={f.k}><label style={{ fontSize:12, color:"var(--m)", display:"block", marginBottom:4 }}>{f.l}</label><input className="inp" placeholder={f.ph} value={vitals[f.k]} onChange={e=>setVitals({...vitals,[f.k]:e.target.value})}/></div>
            ))}
          </div>
          <button className="btn" style={{ marginTop:14, background:"var(--teal)" }} onClick={()=>setSavedV(true)}>Simpan tanda vital</button>
          {savedV && <div style={{ marginTop:10, fontSize:13, color:"var(--green)" }}>✓ Tanda vital disimpan ke rekod pesakit</div>}
        </div>}
      </div>}
      {tab==="ilmu-chat" && <ILMUChat patient={selP||Object.values(PATIENTS)[0]} role="nurse"/>}
    </div>
  );
}

function AdminPortal({ staff }) {
  const [tab, setTab] = useState("gambaran");
  const total = Object.values(PATIENTS).flatMap(p=>p.appointments).length;
  const unpaid = Object.values(PATIENTS).reduce((s,p)=>s+p.outstanding,0);
  const syncItems = [
    {l:"AWS RDS (cloud DB)",s:"Disambung",d:"Sync terakhir: 28s lalu",ok:true},
    {l:"Cakera keras tempatan (NAS)",s:"Aktif",d:"3 rekod dalam cache",ok:true},
    {l:"Cloudflare CDN",s:"Dalam talian",d:"SSL aktif · DDoS protection on",ok:true},
    {l:"Baris gilir sinkronisasi",s:"Kosong",d:"Tiada perubahan tertunda",ok:true},
    {l:"Pembaca NFC (USB → MacBook)",s:"Sedia",d:"Menunggu kad",ok:true},
    {l:"ILMU API (YTL AI Labs)",s:"Dalam talian",d:"nemo-super + ilmu-nemo-nano siap",ok:true},
  ];
  return (
    <div style={{ padding:24, maxWidth:880, margin:"0 auto" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
        <Avatar name={staff.name} color={staff.color} size={40}/>
        <div><div style={{ fontWeight:600 }}>{staff.name}</div><div style={{ fontSize:12, color:"var(--m)" }}>{staff.dept}</div></div>
        <span className="bdg ba_" style={{ marginLeft:"auto" }}>Portal Admin</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:22 }}>
        {[{l:"Pesakit hari ini",v:3,c:"var(--blue)"},{l:"Temujanji",v:total,c:"var(--green)"},{l:"Belum bayar (RM)",v:unpaid,c:"var(--red)"},{l:"Status sistem",v:"Online",c:"var(--green)"}].map(s=>(
          <div key={s.l} style={{ background:"var(--s)", border:"1px solid var(--bd)", borderRadius:12, padding:16 }}><div style={{ fontSize:24, fontWeight:700, color:s.c }}>{s.v}</div><div style={{ fontSize:11, color:"var(--m)", marginTop:2 }}>{s.l}</div></div>
        ))}
      </div>
      <div style={{ display:"flex", gap:2, borderBottom:"1px solid var(--bd)", marginBottom:18 }}>
        {["gambaran","pesakit","sinkronisasi","ilmu-chat"].map(t=><button key={t} className={`tab ${tab===t?"on":""}`} onClick={()=>setTab(t)}>{t==="ilmu-chat"?"🇲🇾 ILMU Chat":t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
      </div>
      {tab==="gambaran" && <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {Object.values(PATIENTS).flatMap(p=>p.appointments).sort((a,b)=>a.date.localeCompare(b.date)).map((a,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:"var(--s)", border:"1px solid var(--bd)", borderRadius:10 }}>
            <div style={{ fontSize:12, color:"var(--m)", minWidth:80 }}>{a.date}</div>
            <div className="mono" style={{ fontSize:12, color:"var(--blue)", minWidth:48 }}>{a.time}</div>
            <div style={{ flex:1, fontSize:13, fontWeight:500 }}>{a.reason}</div>
            <div style={{ fontSize:12, color:"var(--m)" }}>{a.doctor}</div>
            <span className="bdg bg_">{a.dept}</span>
          </div>
        ))}
      </div>}
      {tab==="pesakit" && <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {Object.values(PATIENTS).map(p=>(
          <div key={p.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", background:"var(--s)", border:"1px solid var(--bd)", borderRadius:12 }}>
            <Avatar name={p.name} size={38}/>
            <div style={{ flex:1 }}><div style={{ fontWeight:500 }}>{p.name}</div><div style={{ fontSize:12, color:"var(--m)" }}>{p.id} · {p.visits.length} lawatan · {p.appointments.length} temujanji akan datang</div></div>
            {p.outstanding>0&&<span className="bdg br_">RM{p.outstanding} tertunggak</span>}
            {p.allergies.map(a=><span key={a} className="bdg br_">⚠ {a}</span>)}
          </div>
        ))}
      </div>}
      {tab==="sinkronisasi" && <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {syncItems.map((s,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 16px", background:"var(--s)", border:"1px solid var(--bd)", borderRadius:12 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:s.ok?"var(--green)":"var(--red)", flexShrink:0 }}/>
            <div style={{ flex:1 }}><div style={{ fontWeight:500, fontSize:13 }}>{s.l}</div><div style={{ fontSize:12, color:"var(--m)" }}>{s.d}</div></div>
            <span className={`bdg ${s.ok?"bg_":"br_"}`}>{s.s}</span>
          </div>
        ))}
      </div>}
      {tab==="ilmu-chat" && <ILMUChat patient={Object.values(PATIENTS)[0]} role="admin"/>}
    </div>
  );
}

function Kiosk() {
  const [screen, setScreen] = useState("welcome"); const [patient, setPatient] = useState(null);
  function tap(id){ const p=PATIENTS[id]; if(p){ setPatient(p); setScreen("menu"); } }
  const dk = { background:"#0d1117", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:28 };
  const srf = { background:"#161b22", borderRadius:20, padding:22, border:"1px solid #30363d" };

  if(screen==="welcome") return <div style={dk}><div style={{ width:"100%", maxWidth:400 }}>
    <div style={{ textAlign:"center", marginBottom:28 }}>
      <div style={{ fontSize:50, marginBottom:10 }}>🏥</div>
      <h1 style={{ color:"#e6edf3", fontSize:22, fontWeight:700 }}>Klinik Digital Melaka</h1>
      <p style={{ color:"#8b949e", fontSize:13, marginTop:4 }}>Selamat datang · Welcome · 欢迎</p>
      <div style={{ marginTop:10, display:"inline-flex", gap:6, alignItems:"center", background:"#e8331c18", border:"1px solid #e8331c44", borderRadius:20, padding:"4px 12px" }}>
        <span style={{ fontWeight:700, fontSize:12, color:"#e8331c" }}>ILMU</span>
        <span style={{ fontSize:11, color:"#e8331c88" }}>by YTL AI Labs · AI 🇲🇾</span>
      </div>
    </div>
    <div style={srf}>
      <div style={{ textAlign:"center", marginBottom:18 }}>
        <div style={{ fontSize:38, marginBottom:8 }}>📱</div>
        <h2 style={{ color:"#e6edf3", fontSize:16, fontWeight:500 }}>Ketuk kad IC anda untuk mula</h2>
        <p style={{ color:"#6e7681", fontSize:12, marginTop:4 }}>Letakkan MyKad pada pembaca NFC</p>
      </div>
      <p style={{ color:"#484f58", fontSize:11, marginBottom:8, textAlign:"center" }}>Demo — pilih pesakit:</p>
      {Object.values(PATIENTS).map(p=><button key={p.id} onClick={()=>tap(p.id)} style={{ width:"100%", background:"#21262d", border:"1px solid #30363d", borderRadius:12, padding:"12px 16px", color:"#c9d1d9", fontSize:13, cursor:"pointer", textAlign:"left", display:"flex", gap:10, alignItems:"center", marginBottom:8 }}><span style={{ fontSize:16 }}>📲</span>{p.name} ({p.id})</button>)}
    </div>
  </div></div>;

  if(screen==="menu") return <div style={dk}><div style={{ width:"100%", maxWidth:400 }}>
    <div style={{ ...srf, marginBottom:14, display:"flex", alignItems:"center", gap:14 }}>
      <div style={{ width:44, height:44, borderRadius:"50%", background:"#21262d", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:600, fontSize:14, color:"#8b949e" }}>{patient.name.split(" ").map(w=>w[0]).slice(0,2).join("")}</div>
      <div><div style={{ color:"#e6edf3", fontWeight:600 }}>Selamat datang, {patient.name.split(" ")[0]}!</div><div style={{ color:"#6e7681", fontSize:12 }}>IC: {patient.id}</div></div>
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
      {[{icon:"📅",label:"Daftar masuk",sub:"ke temujanji",action:"checkin",c:"#1d4ed8"},{icon:"🗓️",label:"Tempah",sub:"temujanji baru",action:"book",c:"#6d28d9"},{icon:"💳",label:"Bayar bil",sub:patient.outstanding>0?`RM${patient.outstanding} tertunggak`:"Tiada tunggakan",action:"pay",c:"#059669"},{icon:"🇲🇾",label:"Tanya ILMU",sub:"Pembantu AI Malaysia",action:"chat",c:"#e8331c"}].map(item=>(
        <button key={item.action} onClick={()=>setScreen(item.action)} style={{ background:"#161b22", border:`1px solid ${item.c}33`, borderRadius:16, padding:18, cursor:"pointer", textAlign:"center" }}>
          <div style={{ fontSize:28, marginBottom:8 }}>{item.icon}</div>
          <div style={{ color:"#e6edf3", fontWeight:500, fontSize:14 }}>{item.label}</div>
          <div style={{ color:"#6e7681", fontSize:11, marginTop:2 }}>{item.sub}</div>
        </button>
      ))}
    </div>
    <button onClick={()=>{ setScreen("welcome"); setPatient(null); }} style={{ width:"100%", background:"transparent", border:"1px solid #30363d", borderRadius:12, padding:11, color:"#6e7681", fontSize:13, cursor:"pointer" }}>← Log keluar</button>
  </div></div>;

  if(screen==="checkin") return <div style={dk}><div style={{ width:"100%", maxWidth:400 }}>
    <h2 style={{ color:"#e6edf3", fontWeight:600, marginBottom:18 }}>Temujanji anda</h2>
    {patient.appointments.map((a,i)=><div key={i} style={{ ...srf, marginBottom:12 }}>
      <div style={{ color:"#e6edf3", fontWeight:500, marginBottom:4 }}>{a.reason}</div>
      <div style={{ color:"#6e7681", fontSize:13, marginBottom:14 }}>{a.date} pukul {a.time} · {a.doctor}</div>
      <button onClick={()=>setScreen("checked-in")} style={{ background:"#1d4ed8", border:"none", borderRadius:10, padding:"10px 20px", color:"#fff", fontSize:13, fontWeight:500, cursor:"pointer" }}>Daftar masuk sekarang</button>
    </div>)}
    <button onClick={()=>setScreen("menu")} style={{ width:"100%", background:"transparent", border:"1px solid #30363d", borderRadius:12, padding:11, color:"#6e7681", fontSize:13, cursor:"pointer" }}>← Kembali</button>
  </div></div>;

  if(screen==="checked-in") return <div style={dk}><div style={{ textAlign:"center", maxWidth:340 }}>
    <div style={{ fontSize:56, marginBottom:14 }}>✅</div>
    <h2 style={{ color:"#e6edf3", fontSize:22, fontWeight:700, marginBottom:8 }}>Anda telah didaftarkan!</h2>
    <div style={{ ...srf, margin:"18px 0" }}>
      <div style={{ color:"#6e7681", fontSize:12, marginBottom:4 }}>Nombor giliran anda</div>
      <div className="mono" style={{ color:"#1d4ed8", fontSize:56, fontWeight:700 }}>A004</div>
      <div style={{ color:"#484f58", fontSize:13, marginTop:8 }}>Jururawat Rohani telah dimaklumkan</div>
    </div>
    <button onClick={()=>setScreen("menu")} style={{ background:"#21262d", border:"1px solid #30363d", borderRadius:12, padding:"11px 24px", color:"#8b949e", fontSize:13, cursor:"pointer" }}>Kembali ke menu</button>
  </div></div>;

  if(screen==="pay") return <div style={dk}><div style={{ width:"100%", maxWidth:400 }}>
    <h2 style={{ color:"#e6edf3", fontWeight:600, marginBottom:18 }}>Pembayaran</h2>
    {patient.outstanding>0?<div>
      <div style={{ ...srf, marginBottom:14 }}>
        <div style={{ color:"#e6edf3", fontWeight:500, marginBottom:12 }}>Baki tertunggak</div>
        {patient.visits.filter(v=>!v.paid).map((v,i)=><div key={i} style={{ display:"flex", justifyContent:"space-between", color:"#8b949e", fontSize:13, padding:"7px 0", borderBottom:"1px solid #30363d" }}><span>{v.diagnosis}</span><span>RM{v.amount}</span></div>)}
        <div style={{ display:"flex", justifyContent:"space-between", color:"#e6edf3", fontWeight:700, marginTop:12, fontSize:15 }}><span>Jumlah</span><span>RM{patient.outstanding}</span></div>
      </div>
      {["💳 Kad / Debit","📱 DuitNow QR","💵 Tunai di kaunter"].map(m=><button key={m} onClick={()=>setScreen("paid")} style={{ width:"100%", background:"#21262d", border:"1px solid #30363d", borderRadius:12, padding:"14px 18px", color:"#c9d1d9", fontSize:13, cursor:"pointer", textAlign:"left", marginBottom:10 }}>{m}</button>)}
    </div>:<div style={{ ...srf, textAlign:"center" }}><div style={{ fontSize:40, marginBottom:10 }}>✅</div><div style={{ color:"#e6edf3", fontSize:15, fontWeight:500 }}>Tiada baki tertunggak</div></div>}
    <button onClick={()=>setScreen("menu")} style={{ width:"100%", background:"transparent", border:"1px solid #30363d", borderRadius:12, padding:11, color:"#6e7681", fontSize:13, cursor:"pointer", marginTop:8 }}>← Kembali</button>
  </div></div>;

  if(screen==="paid") return <div style={dk}><div style={{ textAlign:"center", maxWidth:340 }}>
    <div style={{ fontSize:56, marginBottom:14 }}>🎉</div>
    <h2 style={{ color:"#e6edf3", fontSize:20, fontWeight:700, marginBottom:6 }}>Pembayaran berjaya!</h2>
    <div style={{ ...srf, margin:"16px 0", textAlign:"left" }}>
      <div style={{ display:"flex", justifyContent:"space-between", color:"#8b949e", fontSize:13, marginBottom:8 }}><span>Jumlah dibayar</span><span style={{ color:"#3fb950" }}>RM{patient.outstanding}</span></div>
      <div style={{ display:"flex", justifyContent:"space-between", color:"#8b949e", fontSize:13 }}><span>Resit dihantar ke</span><span style={{ fontSize:12 }}>{patient.email}</span></div>
    </div>
    <button onClick={()=>setScreen("menu")} style={{ background:"#21262d", border:"1px solid #30363d", borderRadius:12, padding:"11px 24px", color:"#8b949e", fontSize:13, cursor:"pointer" }}>Kembali ke menu</button>
  </div></div>;

  if(screen==="book") return <div style={dk}><div style={{ width:"100%", maxWidth:400 }}>
    <h2 style={{ color:"#e6edf3", fontWeight:600, marginBottom:18 }}>Tempah Temujanji</h2>
    {[{dept:"Perubatan Umum",doc:"Dr. Sarah Lim",slots:["22 Mei 09:00","22 Mei 11:00","23 Mei 10:30"]},{dept:"Kardiologi",doc:"Dr. Ahmad Faiz",slots:["24 Mei 14:00","25 Mei 09:30"]}].map((d,i)=>(
      <div key={i} style={{ ...srf, marginBottom:12 }}>
        <div style={{ color:"#e6edf3", fontWeight:500, marginBottom:4 }}>{d.dept}</div>
        <div style={{ color:"#6e7681", fontSize:12, marginBottom:12 }}>{d.doc}</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {d.slots.map(s=><button key={s} onClick={()=>setScreen("booked")} style={{ background:"#1d4ed820", border:"1px solid #1d4ed844", borderRadius:8, padding:"6px 12px", color:"#60a5fa", fontSize:12, cursor:"pointer" }}>{s}</button>)}
        </div>
      </div>
    ))}
    <button onClick={()=>setScreen("menu")} style={{ width:"100%", background:"transparent", border:"1px solid #30363d", borderRadius:12, padding:11, color:"#6e7681", fontSize:13, cursor:"pointer" }}>← Kembali</button>
  </div></div>;

  if(screen==="booked") return <div style={dk}><div style={{ textAlign:"center", maxWidth:340 }}>
    <div style={{ fontSize:56, marginBottom:14 }}>📅</div>
    <h2 style={{ color:"#e6edf3", fontSize:20, fontWeight:700, marginBottom:8 }}>Temujanji ditempah!</h2>
    <div style={{ ...srf, margin:"16px 0" }}><div style={{ color:"#6e7681", fontSize:12, marginBottom:4 }}>Pengesahan dihantar ke</div><div style={{ color:"#e6edf3", fontSize:13 }}>{patient.email}</div></div>
    <button onClick={()=>setScreen("menu")} style={{ background:"#21262d", border:"1px solid #30363d", borderRadius:12, padding:"11px 24px", color:"#8b949e", fontSize:13, cursor:"pointer" }}>Kembali ke menu</button>
  </div></div>;

  if(screen==="chat") return <div style={dk}><div style={{ width:"100%", maxWidth:440 }}>
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
      <span style={{ fontWeight:700, fontSize:16, color:"#e8331c" }}>ILMU</span>
      <span style={{ color:"#6e7681", fontSize:13 }}>Pembantu AI Malaysia · YTL AI Labs</span>
      <span style={{ marginLeft:"auto", fontSize:11, background:"#e8331c18", color:"#e8331c", padding:"2px 10px", borderRadius:20 }}>ilmu-nemo-nano</span>
    </div>
    <div style={{ borderRadius:16, overflow:"hidden", border:"1px solid #30363d" }}><ILMUChat patient={patient} role="kiosk"/></div>
    <button onClick={()=>setScreen("menu")} style={{ width:"100%", background:"transparent", border:"1px solid #30363d", borderRadius:12, padding:11, color:"#6e7681", fontSize:13, cursor:"pointer", marginTop:12 }}>← Kembali</button>
  </div></div>;

  return null;
}

export default function App() {
  const [id, setId] = useState(null);
  const staff = id ? (STAFF[id]||{ id:"KIOSK", name:"Kiosk", role:"kiosk", dept:"Self-service", color:"#059669" }) : null;
  if(!id) return <><style>{css}</style><Login onLogin={setId}/></>;
  if(id==="KIOSK") return <><style>{css}</style><Kiosk/></>;
  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
        <div style={{ background:"var(--s)", borderBottom:"1px solid var(--bd)", padding:"10px 24px", display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:10 }}>
          <span style={{ fontSize:18 }}>🏥</span>
          <span style={{ fontWeight:700, fontSize:15 }}>MediRecord Melaka</span>
          <span style={{ color:"var(--h)", fontSize:12 }}>Hibrid Cloud · IoT · NFC</span>
          <span style={{ fontSize:11, color:"var(--ilmu)", background:"var(--is)", padding:"2px 10px", borderRadius:20, fontWeight:700 }}>ILMU AI 🇲🇾</span>
          <div style={{ marginLeft:"auto", display:"flex", gap:8, alignItems:"center" }}>
            <span style={{ fontSize:11, color:"var(--green)", background:"var(--gs)", padding:"2px 8px", borderRadius:20 }}>● Dalam talian</span>
            <button className="btng" onClick={()=>setId(null)} style={{ fontSize:12, padding:"5px 12px" }}>Tukar portal</button>
          </div>
        </div>
        {staff.role==="doctor" && <DoctorPortal staff={staff}/>}
        {staff.role==="nurse"  && <NursePortal  staff={staff}/>}
        {staff.role==="admin"  && <AdminPortal  staff={staff}/>}
      </div>
    </>
  );
}
