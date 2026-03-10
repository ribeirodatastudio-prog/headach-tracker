import { useState, useEffect, useCallback } from "react";

const INTENSITY_COLORS = {
  1: "#6BCB77",
  2: "#A8D96C",
  3: "#FFD93D",
  4: "#FFB347",
  5: "#FF6B6B",
};

const INTENSITY_LABELS = {
  1: "Leve",
  2: "Moderada",
  3: "Perceptível",
  4: "Forte",
  5: "Severa",
};

const TRIGGER_OPTIONS = [
  "Estresse",
  "Sono ruim",
  "Tela demais",
  "Desidratação",
  "Clima",
  "Pulou refeição",
  "Cafeína",
  "Álcool",
  "Exercício",
  "Barulho",
  "Outro",
];

const LOCATION_OPTIONS = [
  "Testa",
  "Têmporas",
  "Atrás dos olhos",
  "Topo da cabeça",
  "Nuca",
  "Um lado só",
  "Toda a cabeça",
];

const STORAGE_KEY = "headache-tracker-entries";

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error("Failed to save:", e);
  }
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", { hour: "numeric", minute: "2-digit" });
}

function getHour(iso) {
  return new Date(iso).getHours();
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

/* ─── Small Components ─── */

function IntensityPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            border: value === n ? `3px solid ${INTENSITY_COLORS[n]}` : "2px solid #2a2a3a",
            background: value === n ? INTENSITY_COLORS[n] + "22" : "#16162a",
            color: value === n ? INTENSITY_COLORS[n] : "#777",
            fontSize: 18,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all .2s",
            fontFamily: "inherit",
          }}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function TagPicker({ options, selected, onChange }) {
  const toggle = (tag) => {
    onChange(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]);
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map((tag) => {
        const active = selected.includes(tag);
        return (
          <button
            key={tag}
            onClick={() => toggle(tag)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: active ? "1.5px solid #c084fc" : "1.5px solid #2a2a3a",
              background: active ? "#c084fc22" : "transparent",
              color: active ? "#c084fc" : "#888",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .15s",
            }}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div
      style={{
        background: "#12122266",
        border: "1px solid #1f1f35",
        borderRadius: 16,
        padding: "18px 20px",
        flex: "1 1 140px",
        minWidth: 130,
      }}
    >
      <div style={{ fontSize: 12, color: "#666", letterSpacing: 1, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: accent || "#e0e0f0", marginTop: 4 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function HourChart({ entries }) {
  const hours = Array(24).fill(0);
  entries.forEach((e) => {
    hours[getHour(e.timestamp)]++;
  });
  const max = Math.max(...hours, 1);
  return (
    <div>
      <div style={{ fontSize: 12, color: "#666", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
        Distribuição por Horário
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 80 }}>
        {hours.map((count, h) => (
          <div
            key={h}
            title={`${h}:00 — ${count} dor${count !== 1 ? "es" : ""}`}
            style={{
              flex: 1,
              height: `${(count / max) * 100}%`,
              minHeight: count > 0 ? 4 : 1,
              background: count > 0 ? "linear-gradient(to top, #c084fc88, #c084fc)" : "#1a1a2e",
              borderRadius: "4px 4px 0 0",
              transition: "height .3s",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {["0h", "6h", "12h", "18h", "0h"].map((l, i) => (
          <span key={i} style={{ fontSize: 10, color: "#555" }}>{l}</span>
        ))}
      </div>
    </div>
  );
}

function Last30Chart({ entries }) {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const start = daysAgo(i);
    const end = daysAgo(i - 1);
    const dayEntries = entries.filter((e) => {
      const d = new Date(e.timestamp);
      return d >= start && d < end;
    });
    const maxIntensity = dayEntries.length ? Math.max(...dayEntries.map((e) => e.intensity)) : 0;
    days.push({ date: start, count: dayEntries.length, maxIntensity });
  }
  return (
    <div>
      <div style={{ fontSize: 12, color: "#666", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
        Últimos 30 Dias
      </div>
      <div style={{ display: "flex", gap: 3 }}>
        {days.map((d, i) => (
          <div
            key={i}
            title={`${formatDate(d.date)} — ${d.count} dor${d.count !== 1 ? "es" : ""}`}
            style={{
              flex: 1,
              height: 28,
              borderRadius: 4,
              background: d.count === 0 ? "#1a1a2e" : INTENSITY_COLORS[d.maxIntensity] || "#c084fc",
              opacity: d.count === 0 ? 0.4 : 0.6 + d.count * 0.15,
              transition: "all .2s",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 10, color: "#555" }}>30 dias atrás</span>
        <span style={{ fontSize: 10, color: "#555" }}>Hoje</span>
      </div>
    </div>
  );
}

function EntryCard({ entry, onDelete }) {
  return (
    <div
      style={{
        background: "#12122288",
        border: "1px solid #1f1f35",
        borderRadius: 14,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        animation: "fadeIn .3s ease",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: INTENSITY_COLORS[entry.intensity] + "25",
          border: `2px solid ${INTENSITY_COLORS[entry.intensity]}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          fontWeight: 800,
          color: INTENSITY_COLORS[entry.intensity],
          flexShrink: 0,
        }}
      >
        {entry.intensity}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#d0d0e8" }}>
            {formatDate(entry.timestamp)}
          </span>
          <span style={{ fontSize: 13, color: "#666" }}>{formatTime(entry.timestamp)}</span>
          <span style={{ fontSize: 11, color: INTENSITY_COLORS[entry.intensity], fontWeight: 600 }}>
            {INTENSITY_LABELS[entry.intensity]}
          </span>
        </div>
        {(entry.triggers.length > 0 || entry.locations.length > 0) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
            {entry.locations.map((l) => (
              <span
                key={l}
                style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 10,
                  background: "#c084fc15",
                  color: "#c084fc99",
                }}
              >
                {l}
              </span>
            ))}
            {entry.triggers.map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 10,
                  background: "#ffffff08",
                  color: "#666",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
        {entry.notes && (
          <div style={{ fontSize: 12, color: "#555", marginTop: 4, fontStyle: "italic" }}>
            {entry.notes}
          </div>
        )}
      </div>
      <button
        onClick={() => onDelete(entry.id)}
        style={{
          background: "none",
          border: "none",
          color: "#444",
          cursor: "pointer",
          fontSize: 18,
          padding: 4,
          lineHeight: 1,
          transition: "color .15s",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => (e.target.style.color = "#ff6b6b")}
        onMouseLeave={(e) => (e.target.style.color = "#444")}
        title="Excluir"
      >
        ×
      </button>
    </div>
  );
}

/* ─── Main App ─── */

export default function App() {
  const [entries, setEntries] = useState(() => loadEntries());
  const [view, setView] = useState("log");
  const [intensity, setIntensity] = useState(3);
  const [triggers, setTriggers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const handleLog = useCallback(() => {
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toISOString(),
      intensity,
      triggers,
      locations,
      notes: notes.trim(),
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    saveEntries(updated);
    setIntensity(3);
    setTriggers([]);
    setLocations([]);
    setNotes("");
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }, [entries, intensity, triggers, locations, notes]);

  const handleDelete = useCallback(
    (id) => {
      const updated = entries.filter((e) => e.id !== id);
      setEntries(updated);
      saveEntries(updated);
    },
    [entries]
  );

  const handleReset = useCallback(() => {
    if (confirm("Apagar TODOS os registros? Isso não pode ser desfeito.")) {
      setEntries([]);
      saveEntries([]);
    }
  }, []);

  // Stats
  const last30 = entries.filter((e) => new Date(e.timestamp) >= daysAgo(30));
  const last7 = entries.filter((e) => new Date(e.timestamp) >= daysAgo(7));
  const avgIntensity = last30.length
    ? (last30.reduce((s, e) => s + e.intensity, 0) / last30.length).toFixed(1)
    : "—";
  const topTrigger = (() => {
    const counts = {};
    last30.forEach((e) => e.triggers.forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.length ? sorted[0][0] : "—";
  })();
  const peakHour = (() => {
    const hours = {};
    entries.forEach((e) => {
      const h = getHour(e.timestamp);
      hours[h] = (hours[h] || 0) + 1;
    });
    const sorted = Object.entries(hours).sort((a, b) => b[1] - a[1]);
    if (!sorted.length) return "—";
    return `${sorted[0][0]}h`;
  })();

  return (
    <div
      style={{
        minHeight: "100vh",
        minHeight: "100dvh",
        background: "#0b0b1a",
        color: "#d0d0e8",
        fontFamily: "'DM Sans', sans-serif",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pop { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { background: #0b0b1a; }
        textarea:focus, input:focus { outline: none; }
        ::selection { background: #c084fc44; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 3px; }
      `}</style>

      <div
        style={{
          maxWidth: 540,
          margin: "0 auto",
          padding: "max(env(safe-area-inset-top, 16px), 16px) 16px 100px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 32, marginBottom: 4 }}>🧠</div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 28,
              fontWeight: 800,
              background: "linear-gradient(135deg, #e0e0f0, #c084fc)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: -0.5,
            }}
          >
            Headache Tracker
          </h1>
          <p style={{ fontSize: 13, color: "#555", marginTop: 4 }}>
            {entries.length} registro{entries.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Nav */}
        <div
          style={{
            display: "flex",
            gap: 4,
            background: "#12122266",
            borderRadius: 14,
            padding: 4,
            marginBottom: 24,
          }}
        >
          {[
            { key: "log", label: "Registrar" },
            { key: "history", label: "Histórico" },
            { key: "insights", label: "Insights" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key)}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 11,
                border: "none",
                background: view === tab.key ? "#c084fc22" : "transparent",
                color: view === tab.key ? "#c084fc" : "#666",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all .2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── LOG ─── */}
        {view === "log" && (
          <div
            style={{
              animation: "fadeIn .3s ease",
              display: "flex",
              flexDirection: "column",
              gap: 22,
            }}
          >
            <div>
              <label style={{ fontSize: 13, color: "#888", fontWeight: 600, display: "block", marginBottom: 8 }}>
                Intensidade
              </label>
              <IntensityPicker value={intensity} onChange={setIntensity} />
              <div style={{ fontSize: 12, color: INTENSITY_COLORS[intensity], marginTop: 6, fontWeight: 600 }}>
                {INTENSITY_LABELS[intensity]}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, color: "#888", fontWeight: 600, display: "block", marginBottom: 8 }}>
                Localização
              </label>
              <TagPicker options={LOCATION_OPTIONS} selected={locations} onChange={setLocations} />
            </div>

            <div>
              <label style={{ fontSize: 13, color: "#888", fontWeight: 600, display: "block", marginBottom: 8 }}>
                Possíveis Gatilhos
              </label>
              <TagPicker options={TRIGGER_OPTIONS} selected={triggers} onChange={setTriggers} />
            </div>

            <div>
              <label style={{ fontSize: 13, color: "#888", fontWeight: 600, display: "block", marginBottom: 8 }}>
                Notas (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Algo mais que vale anotar..."
                rows={2}
                style={{
                  width: "100%",
                  background: "#12122266",
                  border: "1.5px solid #1f1f35",
                  borderRadius: 12,
                  padding: "10px 14px",
                  color: "#d0d0e8",
                  fontSize: 14,
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </div>

            <button
              onClick={handleLog}
              style={{
                width: "100%",
                padding: "14px 0",
                borderRadius: 14,
                border: "none",
                background: saved
                  ? "linear-gradient(135deg, #6BCB77, #4CAF50)"
                  : "linear-gradient(135deg, #c084fc, #a855f7)",
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all .3s",
                boxShadow: saved ? "0 4px 24px #6BCB7733" : "0 4px 24px #c084fc33",
                animation: saved ? "pop .3s ease" : "none",
              }}
            >
              {saved ? "✓ Registrado!" : "Registrar Dor de Cabeça"}
            </button>
          </div>
        )}

        {/* ─── HISTORY ─── */}
        {view === "history" && (
          <div style={{ animation: "fadeIn .3s ease" }}>
            {entries.length === 0 ? (
              <div style={{ textAlign: "center", color: "#555", padding: 40 }}>
                Nenhum registro ainda. Vá em Registrar para anotar sua primeira dor de cabeça.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {entries.map((e) => (
                  <EntryCard key={e.id} entry={e} onDelete={handleDelete} />
                ))}
                <button
                  onClick={handleReset}
                  style={{
                    marginTop: 16,
                    background: "none",
                    border: "1px solid #331111",
                    borderRadius: 10,
                    padding: "8px 16px",
                    color: "#663333",
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    alignSelf: "center",
                  }}
                >
                  Apagar Tudo
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── INSIGHTS ─── */}
        {view === "insights" && (
          <div
            style={{
              animation: "fadeIn .3s ease",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <StatCard label="Últimos 7 dias" value={last7.length} accent="#c084fc" />
              <StatCard label="Últimos 30 dias" value={last30.length} accent="#a855f7" />
              <StatCard label="Intensidade Média" value={avgIntensity} sub="últimos 30d" accent="#FFB347" />
              <StatCard label="Gatilho Principal" value={topTrigger} sub="últimos 30d" accent="#FF6B6B" />
              <StatCard label="Horário Pico" value={peakHour} sub="mais frequente" accent="#6BCB77" />
              <StatCard label="Total Registrado" value={entries.length} accent="#666" />
            </div>

            {entries.length >= 2 && (
              <>
                <div style={{ background: "#12122266", border: "1px solid #1f1f35", borderRadius: 16, padding: 20 }}>
                  <Last30Chart entries={entries} />
                </div>
                <div style={{ background: "#12122266", border: "1px solid #1f1f35", borderRadius: 16, padding: 20 }}>
                  <HourChart entries={entries} />
                </div>
              </>
            )}

            {entries.length < 2 && (
              <div style={{ textAlign: "center", color: "#555", padding: 20 }}>
                Registre pelo menos 2 dores de cabeça para ver gráficos e padrões.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
