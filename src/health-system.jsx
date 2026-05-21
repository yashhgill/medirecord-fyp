import { useMemo, useState } from "react";

const AI_PROVIDERS = {
  openrouter: {
    name: "OpenRouter",
    model: "anthropic/claude-3.5-sonnet",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    env: "VITE_OPENROUTER_API_KEY",
  },
  groq: {
    name: "Groq",
    model: "llama-3.3-70b-versatile",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    env: "VITE_GROQ_API_KEY",
  },
  together: {
    name: "Together AI",
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    endpoint: "https://api.together.xyz/v1/chat/completions",
    env: "VITE_TOGETHER_API_KEY",
  },
};

const patients = [
  {
    id: "IC-001234",
    name: "Ahmad Razif bin Ismail",
    age: 39,
    gender: "Male",
    blood: "O+",
    risk: "Stable",
    allergies: ["Penicillin", "Ibuprofen"],
    phone: "012-3456789",
    email: "ahmad.razif@gmail.com",
    image:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
    vitals: { bp: "135/88", pulse: "78", temp: "36.8", spo2: "98" },
    medications: ["Amlodipine 5mg daily", "Aspirin 100mg daily"],
    appointments: [
      {
        date: "22 May 2026",
        time: "10:30",
        clinician: "Dr. Ahmad Faiz",
        department: "Cardiology",
        reason: "Blood pressure review",
      },
    ],
    visits: [
      {
        date: "20 Nov 2025",
        title: "Acute bronchitis",
        clinician: "Dr. Sarah Lim",
        detail:
          "Productive cough for 5 days. Chest clear. Follow-up in one week.",
        bill: "RM85",
        status: "Paid",
      },
      {
        date: "14 Aug 2025",
        title: "Controlled hypertension",
        clinician: "Dr. Ahmad Faiz",
        detail: "BP 135/88. Weight 78kg. Salt reduction advice given.",
        bill: "RM120",
        status: "Paid",
      },
    ],
  },
  {
    id: "IC-005678",
    name: "Nurul Ain binti Hassan",
    age: 32,
    gender: "Female",
    blood: "A+",
    risk: "Routine",
    allergies: ["Sulfonamides"],
    phone: "016-7891234",
    email: "nurul.ain@yahoo.com",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
    vitals: { bp: "118/76", pulse: "82", temp: "36.7", spo2: "99" },
    medications: ["Folic acid 5mg daily", "Ferrous sulphate 200mg daily"],
    appointments: [
      {
        date: "25 May 2026",
        time: "11:00",
        clinician: "Dr. Priya Nair",
        department: "Obstetrics",
        reason: "32-week prenatal scan",
      },
    ],
    visits: [
      {
        date: "10 Apr 2026",
        title: "Prenatal check, 28 weeks",
        clinician: "Dr. Priya Nair",
        detail: "Normal fetal growth. Fundal height 28cm.",
        bill: "RM150",
        status: "Paid",
      },
    ],
  },
  {
    id: "IC-009012",
    name: "Tan Wei Liang",
    age: 57,
    gender: "Male",
    blood: "B+",
    risk: "Priority",
    allergies: ["Codeine"],
    phone: "019-2345678",
    email: "twl68@hotmail.com",
    image:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=400&q=80",
    vitals: { bp: "148/94", pulse: "91", temp: "36.9", spo2: "96" },
    medications: ["Atorvastatin 40mg nightly", "GTN spray PRN"],
    outstanding: 280,
    appointments: [
      {
        date: "21 May 2026",
        time: "14:00",
        clinician: "Dr. Ahmad Faiz",
        department: "Cardiology",
        reason: "Stress test result review",
      },
    ],
    visits: [
      {
        date: "1 May 2026",
        title: "Chest pain under investigation",
        clinician: "Dr. Ahmad Faiz",
        detail:
          "Exertional chest tightness for two weeks. ECG shows ST changes. Urgent stress echo arranged.",
        bill: "RM280",
        status: "Unpaid",
      },
      {
        date: "20 Dec 2025",
        title: "Hyperlipidemia",
        clinician: "Dr. Ahmad Faiz",
        detail: "LDL 4.2 mmol/L. Statin therapy started.",
        bill: "RM95",
        status: "Paid",
      },
    ],
  },
];

const staff = [
  {
    id: "doctor",
    name: "Dr. Sarah Lim",
    role: "Clinical Workspace",
    department: "General Medicine",
  },
  {
    id: "nurse",
    name: "Nurse Rohani",
    role: "Care Coordination",
    department: "Outpatient Services",
  },
  {
    id: "admin",
    name: "Zainab Rahman",
    role: "Operations Console",
    department: "Administration",
  },
  {
    id: "kiosk",
    name: "Patient Kiosk",
    role: "Self-service Mode",
    department: "Front Desk",
  },
];

const svg = {
  brand: (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 3 29 9.5v13L16 29 3 22.5v-13L16 3Z" />
      <path d="M16 9v14M9 16h14" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m21 21-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z" />
    </svg>
  ),
  send: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
    </svg>
  ),
  activity: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12h4l3-8 4 16 3-8h4" />
    </svg>
  ),
};

async function callTemporaryAI(providerId, patient, prompt) {
  const provider = AI_PROVIDERS[providerId];
  const key = import.meta.env[provider.env];
  const messages = [
    {
      role: "system",
      content:
        "You are a concise healthcare operations assistant. Summarize patient context, administrative tasks, and next-step suggestions for a clinic dashboard. Do not provide a diagnosis.",
    },
    {
      role: "user",
      content: `Patient: ${patient.name}, age ${patient.age}, allergies ${patient.allergies.join(
        ", ",
      )}, medications ${patient.medications.join(
        ", ",
      )}, recent visit ${patient.visits[0].title}. Request: ${prompt}`,
    },
  ];

  if (!key) {
    await new Promise((resolve) => setTimeout(resolve, 450));
    return `${provider.name} demo response: ${patient.name} is flagged as ${patient.risk.toLowerCase()}. Review allergies (${patient.allergies.join(
      ", ",
    )}), confirm current medication adherence, and prepare the clinician for ${
      patient.appointments[0]?.reason || "the next scheduled encounter"
    }. Add a follow-up task if new symptoms or payment issues are mentioned.`;
  }

  const response = await fetch(provider.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      max_tokens: 550,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`${provider.name} returned ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No response returned.";
}

function Icon({ children }) {
  return <span className="icon">{children}</span>;
}

function Metric({ label, value, tone = "blue" }) {
  return (
    <article className={`metric metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function PatientRow({ patient, active, onClick }) {
  return (
    <button className={`patient-row ${active ? "active" : ""}`} onClick={onClick}>
      <img src={patient.image} alt="" />
      <span>
        <strong>{patient.name}</strong>
        <small>
          {patient.id} · {patient.appointments[0]?.department}
        </small>
      </span>
      <em className={`risk ${patient.risk.toLowerCase()}`}>{patient.risk}</em>
    </button>
  );
}

function AIConsole({ patient, provider, setProvider }) {
  const [input, setInput] = useState("Summarise the priority actions for this patient.");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true);
    setError("");
    try {
      setAnswer(await callTemporaryAI(provider, patient, input));
    } catch (event) {
      setError(event.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel ai-panel">
      <div className="panel-title">
        <span>
          <small>Temporary AI Provider</small>
          <strong>{AI_PROVIDERS[provider].name}</strong>
        </span>
        <select value={provider} onChange={(event) => setProvider(event.target.value)}>
          {Object.entries(AI_PROVIDERS).map(([id, item]) => (
            <option key={id} value={id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <p className="muted">
        Uses {AI_PROVIDERS[provider].env} when present. Without a key, the app keeps a polished simulated workflow for demos.
      </p>
      <div className="prompt-box">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={3}
        />
        <button className="primary icon-button" onClick={run} disabled={loading}>
          <Icon>{svg.send}</Icon>
          {loading ? "Running" : "Ask AI"}
        </button>
      </div>
      {error && <div className="alert">AI request failed: {error}</div>}
      {answer && <div className="ai-answer">{answer}</div>}
    </section>
  );
}

function ClinicalWorkspace({ selected, setSelected, provider, setProvider }) {
  const [tab, setTab] = useState("overview");
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");

  return (
    <main className="workspace">
      <section className="hero-grid">
        <div className="hero-copy">
          <h1>HarNova MediSolutions</h1>
          <p>
            A professional hybrid health record workspace for clinics, care teams,
            and patient self-service.
          </p>
          <div className="hero-actions">
            <button className="primary">Start consultation</button>
            <button className="secondary">Export daily brief</button>
          </div>
        </div>
        <div className="hero-image" aria-hidden="true" />
      </section>

      <section className="metrics-grid">
        <Metric label="Patients today" value="24" />
        <Metric label="Waiting" value="07" tone="amber" />
        <Metric label="AI briefs generated" value="18" tone="green" />
        <Metric label="Outstanding billing" value="RM280" tone="red" />
      </section>

      <section className="content-grid">
        <aside className="panel patient-list">
          <div className="panel-title">
            <span>
              <small>Patient Queue</small>
              <strong>Live Registry</strong>
            </span>
          </div>
          <div className="search">
            <Icon>{svg.search}</Icon>
            <span>Search by IC, NFC, or name</span>
          </div>
          {patients.map((patient) => (
            <PatientRow
              key={patient.id}
              patient={patient}
              active={selected.id === patient.id}
              onClick={() => setSelected(patient)}
            />
          ))}
        </aside>

        <section className="patient-detail">
          <div className="profile-card panel">
            <img src={selected.image} alt="" />
            <div>
              <div className="patient-kicker">{selected.id}</div>
              <h2>{selected.name}</h2>
              <p>
                {selected.age} years · {selected.gender} · Blood {selected.blood}
              </p>
              <div className="chips">
                {selected.allergies.map((allergy) => (
                  <span className="chip danger" key={allergy}>
                    {allergy}
                  </span>
                ))}
                {selected.outstanding && <span className="chip warning">RM{selected.outstanding} due</span>}
              </div>
            </div>
          </div>

          <div className="tabs">
            {["overview", "visits", "medication", "notes"].map((item) => (
              <button
                className={tab === item ? "active" : ""}
                key={item}
                onClick={() => setTab(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="detail-grid">
              <section className="panel">
                <div className="panel-title">
                  <span>
                    <small>Next Appointment</small>
                    <strong>{selected.appointments[0].reason}</strong>
                  </span>
                </div>
                <div className="appointment">
                  <strong>{selected.appointments[0].date}</strong>
                  <span>{selected.appointments[0].time}</span>
                  <p>
                    {selected.appointments[0].clinician} · {selected.appointments[0].department}
                  </p>
                </div>
              </section>
              <section className="panel vitals">
                <div className="panel-title">
                  <span>
                    <small>Latest Vitals</small>
                    <strong>Pre-consultation</strong>
                  </span>
                  <Icon>{svg.activity}</Icon>
                </div>
                {Object.entries(selected.vitals).map(([label, value]) => (
                  <div className="vital" key={label}>
                    <span>{label.toUpperCase()}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </section>
              <AIConsole patient={selected} provider={provider} setProvider={setProvider} />
            </div>
          )}

          {tab === "visits" && (
            <section className="timeline">
              {selected.visits.map((visit) => (
                <article className="panel visit" key={visit.date}>
                  <span>{visit.date}</span>
                  <h3>{visit.title}</h3>
                  <p>{visit.detail}</p>
                  <footer>
                    <small>{visit.clinician}</small>
                    <em className={visit.status === "Paid" ? "paid" : "unpaid"}>
                      {visit.status} · {visit.bill}
                    </em>
                  </footer>
                </article>
              ))}
            </section>
          )}

          {tab === "medication" && (
            <section className="panel medication">
              <div className="panel-title">
                <span>
                  <small>Medication Profile</small>
                  <strong>Active prescriptions</strong>
                </span>
              </div>
              {selected.medications.map((item) => (
                <div className="med-row" key={item}>
                  <span />
                  <strong>{item}</strong>
                  <small>verified</small>
                </div>
              ))}
            </section>
          )}

          {tab === "notes" && (
            <section className="panel notes">
              <div className="panel-title">
                <span>
                  <small>Clinical Note</small>
                  <strong>Draft encounter note</strong>
                </span>
              </div>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={7}
                placeholder="Document assessment, plan, follow-up, and patient instructions..."
              />
              <div className="note-actions">
                <button
                  className="primary"
                  onClick={() => {
                    setSavedNote(note);
                    setNote("");
                  }}
                >
                  Save note
                </button>
                <button className="secondary" onClick={() => setNote("")}>
                  Clear
                </button>
              </div>
              {savedNote && <div className="success">Saved note: {savedNote}</div>}
            </section>
          )}
        </section>
      </section>
    </main>
  );
}

function OperationsConsole({ provider, setProvider }) {
  return (
    <main className="workspace">
      <section className="ops-header panel">
        <div>
          <small>Administration</small>
          <h1>Operations command center</h1>
          <p>
            Monitor billing, cloud sync, appointment flow, and temporary AI
            provider health from one focused console.
          </p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80"
          alt=""
        />
      </section>
      <section className="metrics-grid">
        <Metric label="Cloud sync" value="Online" tone="green" />
        <Metric label="NFC readers" value="3/3" />
        <Metric label="Queue delay" value="11m" tone="amber" />
        <Metric label="Open invoices" value="1" tone="red" />
      </section>
      <section className="admin-grid">
        <div className="panel">
          <div className="panel-title">
            <span>
              <small>Clinic Schedule</small>
              <strong>Today</strong>
            </span>
          </div>
          {patients.flatMap((patient) =>
            patient.appointments.map((appointment) => (
              <div className="schedule-row" key={`${patient.id}-${appointment.time}`}>
                <strong>{appointment.time}</strong>
                <span>
                  {patient.name}
                  <small>{appointment.department} · {appointment.reason}</small>
                </span>
              </div>
            )),
          )}
        </div>
        <div className="panel">
          <div className="panel-title">
            <span>
              <small>Infrastructure</small>
              <strong>System status</strong>
            </span>
          </div>
          {["AWS RDS mirror", "Local NAS backup", "Cloudflare edge", "NFC bridge", "AI provider route"].map(
            (item) => (
              <div className="status-row" key={item}>
                <span />
                <strong>{item}</strong>
                <small>healthy</small>
              </div>
            ),
          )}
        </div>
        <AIConsole patient={patients[2]} provider={provider} setProvider={setProvider} />
      </section>
    </main>
  );
}

function Kiosk() {
  const [selected, setSelected] = useState(patients[0]);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <main className="kiosk">
      <section className="kiosk-shell">
        <div className="kiosk-media" />
        <div className="kiosk-panel">
          <h1>HarNova patient check-in</h1>
          <p>Fast self-service arrival, appointment review, and billing support.</p>
          <div className="kiosk-patients">
            {patients.map((patient) => (
              <button
                key={patient.id}
                className={selected.id === patient.id ? "active" : ""}
                onClick={() => {
                  setSelected(patient);
                  setConfirmed(false);
                }}
              >
                <img src={patient.image} alt="" />
                <span>
                  {patient.name}
                  <small>{patient.id}</small>
                </span>
              </button>
            ))}
          </div>
          <div className="kiosk-card">
            <small>Upcoming appointment</small>
            <strong>{selected.appointments[0].reason}</strong>
            <span>
              {selected.appointments[0].date} · {selected.appointments[0].time}
            </span>
          </div>
          <button className="primary wide" onClick={() => setConfirmed(true)}>
            Confirm arrival
          </button>
          {confirmed && <div className="success">You are checked in. Queue number A004.</div>}
        </div>
      </section>
    </main>
  );
}

function Shell() {
  const [activeStaff, setActiveStaff] = useState(staff[0]);
  const [selected, setSelected] = useState(patients[2]);
  const [provider, setProvider] = useState("openrouter");

  const portal = useMemo(() => {
    if (activeStaff.id === "admin") {
      return <OperationsConsole provider={provider} setProvider={setProvider} />;
    }
    if (activeStaff.id === "kiosk") {
      return <Kiosk />;
    }
    return (
      <ClinicalWorkspace
        selected={selected}
        setSelected={setSelected}
        provider={provider}
        setProvider={setProvider}
      />
    );
  }, [activeStaff.id, provider, selected]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Icon>{svg.brand}</Icon>
          <span>
            <strong>HarNova</strong>
            <small>MediSolutions</small>
          </span>
        </div>
        <nav className="portal-nav">
          {staff.map((person) => (
            <button
              key={person.id}
              className={activeStaff.id === person.id ? "active" : ""}
              onClick={() => setActiveStaff(person)}
            >
              <strong>{person.role}</strong>
              <small>{person.name}</small>
            </button>
          ))}
        </nav>
        <div className="sidebar-card">
          <small>Temporary AI route</small>
          <strong>{AI_PROVIDERS[provider].name}</strong>
          <span>{AI_PROVIDERS[provider].model}</span>
        </div>
      </aside>
      <section className="main-shell">
        <header className="topbar">
          <div>
            <strong>{activeStaff.name}</strong>
            <span>{activeStaff.department}</span>
          </div>
          <select value={provider} onChange={(event) => setProvider(event.target.value)}>
            {Object.entries(AI_PROVIDERS).map(([id, item]) => (
              <option key={id} value={id}>
                {item.name}
              </option>
            ))}
          </select>
        </header>
        {portal}
      </section>
    </div>
  );
}

export default function App() {
  return <Shell />;
}
