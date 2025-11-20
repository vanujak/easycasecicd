import { useEffect, useMemo, useRef, useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function CaseDetailOverlay({ caseId, onClose }) {
  const token = localStorage.getItem("token");
  const [caseDoc, setCaseDoc] = useState(null);
  const [hearings, setHearings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openHearing, setOpenHearing] = useState(false);
  const [error, setError] = useState("");

  const isClosed = caseDoc?.status === "closed";

  async function fetchAll() {
    setLoading(true);
    setError("");
    try {
      const [cRes, hRes] = await Promise.all([
        fetch(`${API}/api/cases/${caseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/api/hearings?caseId=${caseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const c = await cRes.json();
      const h = await hRes.json();
      if (!cRes.ok) throw new Error(c?.error || "Failed to load case");
      if (!hRes.ok) throw new Error(h?.error || "Failed to load hearings");
      setCaseDoc(c);
      setHearings(
        (Array.isArray(h) ? h : []).sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        )
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const nextHearingLabel = useMemo(() => {
    const withNext = (hearings || []).filter(h => h.nextDate);
    if (!withNext.length) return null;

    const latest = withNext.reduce((a, b) =>
      new Date(a.date) > new Date(b.date) ? a : b
    );
    return new Date(latest.nextDate).toLocaleDateString();
  }, [hearings]);
  

  return (
    <div className="fixed inset-0 z-[1050] bg-black/40 backdrop-blur-sm">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden bg-white shadow-2xl md:rounded-xl md:my-4 md:h-[95vh]">
        
        {/* === OPTIMIZED HEADER === */}
        <div className="sticky top-0 z-10 border-b bg-white px-4 py-3 shadow-sm">
          
          {/* Mobile Layout: Close Top-Right, Title Top-Left, Button Bottom */}
          {/* Desktop Layout: Button Left, Title Center, Close Right */}
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-center">
            
            {/* 1. Close Button (Absolute Top Right for Mobile & Desktop) */}
            <button
              onClick={onClose}
              className="absolute right-0 top-0 -mr-2 -mt-2 p-2 text-gray-500 hover:text-gray-800 md:static md:right-auto md:top-auto md:mr-0 md:mt-0 md:rounded-md md:border md:px-3 md:py-2 md:hover:bg-gray-50 md:order-3 md:ml-auto"
            >
              ✕
            </button>

            {/* 2. Case Info (Title) */}
            <div className="mb-3 mr-8 flex flex-col md:mb-0 md:mr-0 md:items-center md:order-2 md:flex-1 md:px-4">
                <h2 className="text-lg font-bold leading-tight md:text-xl">
                  {loading ? "Loading…" : caseDoc?.title}
                </h2>
                {!loading && caseDoc && (
                  <p className="text-xs text-gray-500 md:text-sm">
                    {caseDoc.clientName ? `${caseDoc.clientName} • ` : ""}
                    {caseDoc.courtType}
                    {caseDoc.courtPlace ? ` — ${caseDoc.courtPlace}` : ""}
                    {caseDoc.number ? ` • #${caseDoc.number}` : ""}
                  </p>
                )}
            </div>

            {/* 3. Add Hearing Button */}
            <div className="md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2 md:order-1">
               <button
                  disabled={isClosed}
                  onClick={() => setOpenHearing(true)}
                  className={`w-full rounded-lg px-4 py-2 text-sm font-semibold shadow-sm md:w-auto ${
                    isClosed
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-transform"
                  }`}
                >
                  + Add hearing
                </button>
            </div>

          </div>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 bg-gray-50/50">
          {!loading && nextHearingLabel && (
            <div className="mt-6 flex justify-center">
              <div className="rounded-full border bg-white px-4 py-1 text-sm font-medium text-blue-800 shadow-sm ring-4 ring-blue-50">
                Next hearing: <span className="font-bold">{nextHearingLabel}</span>
              </div>
            </div>
          )}

          {error && <p className="mt-4 text-center text-red-600">{error}</p>}
          
          {loading ? (
            <div className="mt-10 text-center text-gray-500">Loading timeline…</div>
          ) : (
            <Timeline startedAt={caseDoc.createdAt} hearings={hearings} />
          )}
        </div>
      </div>

      {/* Hearing Modal */}
      {openHearing && (
        <HearingModal
          caseId={caseId}
          onClose={() => setOpenHearing(false)}
          onSaved={() => {
            setOpenHearing(false);
            fetchAll();
          }}
        />
      )}
    </div>
  );
}

/* ----------------------------- Timeline ----------------------------- */
function Timeline({ startedAt, hearings }) {
  const items = [
    ...(hearings || [])
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((h, i) => {
        const isLatest = i === 0;
        const hasNext  = Boolean(h.nextDate);
        const title    = isLatest && hasNext
          ? `Next hearing: ${new Date(h.nextDate).toLocaleDateString()}`
          : new Date(h.date).toLocaleDateString();

        const footerBits = [
          h.outcome ? `Outcome: ${h.outcome}` : null,
        ].filter(Boolean);

        return {
          key: h._id || `h-${i}`,
          side: i % 2 === 0 ? "left" : "right",
          title,
          subtitle: h.venue || null,
          body: h.notes || "",
          footer: footerBits.length ? footerBits.join("  •  ") : null,
        };
      }),
    {
      key: "start",
      side: (hearings?.length ?? 0) % 2 === 0 ? "left" : "right",
      isStart: true,
      title: "Case started",
      subtitle: new Date(startedAt).toLocaleDateString(),
      body: "— Beginning of the case —",
      footer: null,
    },
  ];

  const wrapRef = useRef(null);
  const [linePos, setLinePos] = useState({ top: 0, bottom: 0 });

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const dots = Array.from(wrap.querySelectorAll("[data-dot='1']"));
    if (!dots.length) return;

    const wrapBox = wrap.getBoundingClientRect();
    const first = dots[0].getBoundingClientRect();
    const last = dots[dots.length - 1].getBoundingClientRect();
    const firstY = first.top - wrapBox.top + first.height / 2;
    const lastY = last.top - wrapBox.top + last.height / 2;

    setLinePos({ top: firstY, bottom: wrapBox.height - lastY });
  }, [items.length]);

  return (
    <section className="relative mx-auto mt-8 max-w-5xl" ref={wrapRef}>
      <ul className="relative grid grid-cols-[1fr_30px_1fr] md:grid-cols-[1fr_40px_1fr] gap-x-2 md:gap-x-6">
        <div
          className="absolute left-1/2 w-0.5 -translate-x-1/2 bg-gray-300"
          style={{ top: `${linePos.top}px`, bottom: `${linePos.bottom}px` }}
        />
        {items.map((it) => (
          <TimelineRow key={it.key} item={it} />
        ))}
      </ul>
    </section>
  );
}

function TimelineRow({ item }) {
  const card = (
    <div className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      {item.subtitle && (
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{item.subtitle}</div>
      )}
      <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
      {item.body && <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{item.body}</p>}
      {item.footer && <div className="mt-3 border-t pt-2 text-xs font-medium text-gray-500">{item.footer}</div>}
    </div>
  );

  return (
    <>
      <div className="col-start-1 mb-8 md:mb-12">
        {item.side === "left" ? card : <div className="hidden md:block" />}
      </div>
      <div className="relative col-start-2 mb-8 md:mb-12 flex items-start pt-6 justify-center">
        <span
          data-dot="1"
          className="block h-3 w-3 rounded-full bg-gray-800 ring-4 ring-white"
        />
      </div>
      <div className="col-start-3 mb-8 md:mb-12">
        {item.side === "right" ? card : <div className="hidden md:block" />}
      </div>
    </>
  );
}

/* --------------------------- Hearing Modal --------------------------- */
function HearingModal({ caseId, onClose, onSaved }) {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    date: "", 
    notes: "",
    outcome: "Adjourned",
    nextDate: "", 
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const OUTCOMES = ["Adjourned", "Continued", "Judgment", "Settled", "Other"];

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const toIsoDateOnly = (yyyyMmDd) => {
    if (!yyyyMmDd) return undefined;
    const [y, m, d] = yyyyMmDd.split("-").map(Number);
    const dt = new Date(y, m - 1, d, 0, 0, 0, 0);
    return dt.toISOString();
  };

  const validate = () => {
    if (!form.date) return "Please select the hearing date.";
    if (!form.outcome) return "Please select an outcome.";
    if (!form.nextDate) return "Please select the next hearing date.";
    const d1 = new Date(form.date);
    const d2 = new Date(form.nextDate);
    if (d2 < d1) return "Next hearing date cannot be earlier than the hearing date.";
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setErr(v); return; }
    setSaving(true); setErr("");

    try {
      const payload = {
        caseId,
        date: toIsoDateOnly(form.date),
        notes: form.notes?.trim() || undefined,
        outcome: form.outcome,
        nextDate: toIsoDateOnly(form.nextDate),
      };

      const res = await fetch(`${API}/api/hearings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create hearing");

      onSaved?.(); 
      onClose(); 
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setSaving(false);
    }
  };

  const notesMax = 1000;

  return (
    // Z-Index 1060 to stay above the details overlay
    <div className="fixed inset-0 z-[1060] grid place-items-center bg-black/50 p-0 md:p-4">
      
      {/* Mobile Optimized Container:
          - w-[95%]: Almost full width on mobile
          - max-h-[85vh]: Prevents overflow when keyboard opens
          - overflow-y-auto: Allows scrolling inside the modal
      */}
      <div className="relative w-[95%] max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Add hearing</h2>
          <button
            onClick={onClose}
            className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200"
          >
            ✕
          </button>
        </div>

        {err && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-100">
            {err}
          </div>
        )}

        <form onSubmit={submit} className="grid gap-5">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={onChange}
              required
              className="w-full rounded-lg border-gray-300 border px-3 py-2.5 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes <span className="text-gray-400 font-normal text-xs">(optional)</span>
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value.slice(0, notesMax) }))}
              rows={3}
              placeholder="Summary of the hearing..."
              className="w-full rounded-lg border-gray-300 border px-3 py-2.5 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <div className="mt-1 text-right text-xs text-gray-400">
              {form.notes.length}/{notesMax}
            </div>
          </div>

          {/* Outcome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Outcome <span className="text-red-600">*</span>
            </label>
            <select
              name="outcome"
              value={form.outcome}
              onChange={onChange}
              required
              className="w-full rounded-lg border-gray-300 border px-3 py-2.5 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {OUTCOMES.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          {/* Next Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Next hearing date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              name="nextDate"
              value={form.nextDate}
              onChange={onChange}
              required
              className="w-full rounded-lg border-gray-300 border px-3 py-2.5 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="mt-2 flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Hearing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}