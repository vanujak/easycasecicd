import { useEffect, useMemo, useState } from "react";
import NavbarDashboard from "../../components/NavbarDashboard.jsx";
import { SRI_LANKA_DISTRICTS, SRI_LANKA_PROVINCES } from "../../constants/geo.js";
import { COURT_TYPES } from "../../constants/courts.js";
import CaseDetailsOverlay from "../../components/CaseDetailsOverlay.jsx";

const API = import.meta.env.VITE_API_URL;

const CLIENT_TYPES = [
  "individual",
  "company",
  "government",
  "organization",
];

function normalizeSriLankaPhone(input = "") {
  const digits = input.replace(/[^\d]/g, "");
  if (!digits) return "";
  if (digits.startsWith("94")) return `+${digits}`;
  if (digits.startsWith("0"))   return `+94${digits.slice(1)}`;
  if (digits.startsWith("+94")) return `+94${digits.slice(3)}`;
  return `+94${digits}`;
}

export default function Cases() {
  const token = localStorage.getItem("token");
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  const [openCaseModal, setOpenCaseModal] = useState(false);
  const [openCaseId, setOpenCaseId] = useState(null); // selected case (details drawer)

  // Prevent background scroll when overlay is open
  useEffect(() => {
    if (openCaseId || openCaseModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openCaseId, openCaseModal]);

  const closeCase = async (id) => {
    if (!confirm("Close this case? You won’t be able to add new hearings.")) return;
    try {
      const res = await fetch(`${API}/api/cases/${id}/close`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return alert(data?.error || "Failed to close case");
      fetchCases(q); // refresh list
    } catch (e) {
      alert(e.message);
    }
  };

  const deleteCase = async (id) => {
    if (!confirm("Delete this case permanently? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API}/api/cases/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return alert(data?.error || "Failed to delete case");
      fetchCases(q); // refresh list
    } catch (e) {
      alert(e.message);
    }
  };

  const fetchCases = async (query = "") => {
    setLoading(true); setError("");
    try {
      const url = `${API}/api/cases${query ? `?q=${encodeURIComponent(query)}` : ""}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load cases");
      setCases(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCases(); }, []);

  // ---------- UI ----------
  return (
    <main className="min-h-screen bg-gray-50">
      <NavbarDashboard />

      <div className="mx-auto max-w-6xl px-4 py-8">

        {/* === STICKY HEADER SECTION === 
            Wraps Title, Button, and Search in a sticky container.
            z-40 ensures it sits above the list but below modals.
        */}
        <div className="sticky top-0 z-40 bg-gray-50 pb-4 border-b border-gray-50">
          
          {/* 1. Title + New Case Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <h1 className="text-2xl font-bold">Cases</h1>
            <button
              onClick={() => setOpenCaseModal(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold shadow hover:bg-blue-700"
            >
              + New case
            </button>
          </div>

          {/* 2. Search Bar */}
          <div className="mt-4 bg-white rounded-xl border p-4 shadow-sm">
            <form
              onSubmit={(e) => { e.preventDefault(); fetchCases(q.trim()); }}
              className="flex gap-2"
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title or case number..."
                className="flex-1 rounded-lg border px-3 py-2"
              />
              <button 
                type="submit"
                className="rounded-lg bg-black px-4 py-2 text-white font-semibold"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {error && <p className="mt-4 text-red-600">{error}</p>}

        {/* ------------------ LIST SECTION ------------------ 
            relative z-0: Forces list to slide UNDER the z-40 header
        */}
        <div className="mt-4 relative z-0">

          {/* === MOBILE CARD VIEW (Visible only on small screens) === */}
          <div className="space-y-3 md:hidden">
            {loading ? (
              <p className="text-gray-500 text-center py-6">Loading…</p>
            ) : cases.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No cases found.</p>
            ) : (
              cases.map((c) => (
                <div 
                  key={c._id} 
                  onClick={() => setOpenCaseId(c._id)}
                  className="rounded-xl border bg-white p-4 shadow-sm active:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                        <span className="inline-block rounded bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600 mb-1">
                          #{c.number}
                        </span>
                        <h3 className="font-semibold text-lg leading-tight">{c.title}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                      c.status === 'closed' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium text-gray-900">Client:</span> {c.clientName || "—"}</p>
                    <p><span className="font-medium text-gray-900">Court:</span> {c.courtType} {c.courtPlace ? `(${c.courtPlace})` : ""}</p>
                    <p><span className="font-medium text-gray-900">Date:</span> {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-2 pt-3 border-t">
                    <button
                      onClick={(e) => { e.stopPropagation(); closeCase(c._id); }}
                      disabled={c.status === "closed"}
                      className="flex-1 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {c.status === "closed" ? "Closed" : "Close"}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteCase(c._id); }}
                      className="flex-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* === DESKTOP TABLE VIEW (Hidden on mobile) === */}
          <div className="hidden md:block overflow-hidden rounded-xl border bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Court</th>
                  <th className="px-4 py-3">Place</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="px-4 py-6" colSpan={8}>Loading…</td></tr>
                ) : cases.length === 0 ? (
                  <tr><td className="px-4 py-10 text-center text-gray-500" colSpan={8}>No cases yet.</td></tr>
                ) : (
                  cases.map((c) => (
                    <tr
                      key={c._id}
                      className="border-t hover:bg-gray-50 cursor-pointer"
                      onClick={() => setOpenCaseId(c._id)}
                    >
                      <td className="px-4 py-3 text-gray-600">#{c.number}</td> 
                      <td className="px-4 py-3 font-medium">{c.title}</td>
                      <td className="px-4 py-3">{c.clientName || "—"}</td>
                      <td className="px-4 py-3">{c.courtType}</td>
                      <td className="px-4 py-3">{c.courtPlace || "—"}</td>
                      <td className="px-4 py-3 capitalize">
                         <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            c.status === 'closed' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                         }`}>
                            {c.status}
                         </span>
                      </td>
                      <td className="px-4 py-3">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); closeCase(c._id); }}
                            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
                            disabled={c.status === "closed"}
                            title={c.status === "closed" ? "Already closed" : "Close case"}
                          >
                            Close
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteCase(c._id); }}
                            className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals / Overlays */}
      {openCaseId && (
        <CaseDetailsOverlay
          caseId={openCaseId}
          onClose={() => setOpenCaseId(null)}
        />
      )}
      
      {openCaseModal && (
        <CaseModal
          onClose={() => setOpenCaseModal(false)}
          onSaved={() => {
            setOpenCaseModal(false);
            fetchCases();
          }}
        />
      )}
    </main>
  );
}

/* ----------------------------- CaseModal ----------------------------- */
function CaseModal({ onClose, onSaved }) {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    title: "",
    type: "",
    clientId: "",
    // Safety check: uses first court type, or empty string if undefined
    courtType: COURT_TYPES?.[0] || "",
    courtPlace: "",
    status: "open",
  });
  const [nextNumber, setNextNumber] = useState(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch(`${API}/api/cases/next-number`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (isMounted) setNextNumber(data?.next ?? null);
      } catch {
        if (isMounted) setNextNumber(null);
      }
    })();
    return () => { isMounted = false; };
  }, [token]);

  // client search (async)
  const [clientQuery, setClientQuery] = useState("");
  const [clientResults, setClientResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // toggle "add new client here"
  const [addClient, setAddClient] = useState(false);

  // new client form
  const [newClient, setNewClient] = useState({
    type: "individual",
    name: "",
    email: "",
    phone: "",
    address: "",
    district: "", 
  });

  const canPickDistrict = useMemo(
    () => form.courtType === "District Court" || form.courtType === "High Court",
    [form.courtType]
  );
  const canPickProvince = useMemo(
    () => form.courtType === "Provincial High Court",
    [form.courtType]
  );
  const fixedColombo = useMemo(
    () => form.courtType === "Court of Appeal" || form.courtType === "Supreme Court",
    [form.courtType]
  );

  useEffect(() => {
    if (fixedColombo) {
      setForm((f) => ({ ...f, courtPlace: "Colombo" }));
    } else {
      setForm((f) => ({ ...f, courtPlace: "" }));
    }
  }, [fixedColombo]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // search clients by name
  const searchClients = async (q) => {
    setSearching(true);
    try {
      const res = await fetch(`${API}/api/clients?q=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setClientResults(Array.isArray(data) ? data : []);
    } catch {
      setClientResults([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const id = setTimeout(() => {
      if (clientQuery.trim()) searchClients(clientQuery.trim());
      else setClientResults([]);
    }, 300);
    return () => clearTimeout(id);
  }, [clientQuery]);

  const createClientInline = async () => {
    const payload = {
      ...newClient,
      phone: newClient.phone ? normalizeSriLankaPhone(newClient.phone) : undefined,
    };

    // remove "" and undefined 
    const clean = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== "" && v != null)
    );

    const res = await fetch(`${API}/api/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(clean),
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data?.error || "Failed to create client");
      return;
    }

    // Select the freshly created client
    setForm((f) => ({ ...f, clientId: data._id }));
    setClientQuery(data.name);
    setClientResults([data]);
    setAddClient(false);
  };

  const submitCase = async (e) => {
    e.preventDefault();
    if (!form.clientId) {
      alert("Please pick or add a client first.");
      return;
    }

    const payload = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== "")
    );

    const res = await fetch(`${API}/api/cases`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to create case");

    onSaved();
  };

  // IMPORTANT: z-[1000] keeps it above the sticky header
  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">New case</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-gray-100">✕</button>
        </div>

        <form onSubmit={submitCase} className="mt-4">
          <div className={`grid gap-4 ${addClient ? "max-h-[70vh] overflow-y-auto pr-2" : ""}`}>
            
            {/* Title + Case number */}
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={onChange}
                  required
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Case number</label>
                <input value={`#${nextNumber || "…"}`} readOnly
                  className="w-full rounded-lg border px-3 py-2 bg-gray-100" />
                <p className="mt-1 text-xs text-gray-500">
                  Assigned automatically.
                </p>
              </div>
            </div>

            {/* Type of case */}
            <div>
              <label className="block text-sm mb-1">Type of case</label>
              <input
                name="type"
                value={form.type}
                onChange={onChange}
                placeholder="e.g., Property dispute"
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            {/* Client section */}
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">Client</label>
                <button
                  type="button"
                  onClick={() => setAddClient(v => !v)}
                  className="text-sm underline"
                >
                  {addClient ? "Pick existing instead" : "Add new client here"}
                </button>
              </div>

              {!addClient ? (
                // --- Pick existing client ---
                <div className="mt-2">
                  <input
                    value={clientQuery}
                    onChange={(e) => setClientQuery(e.target.value)}
                    placeholder="Search client by name…"
                    className="w-full rounded-lg border px-3 py-2"
                  />
                  {searching && <p className="text-xs mt-1">Searching…</p>}
                  {clientResults.length > 0 && (
                    <div className="mt-2 max-h-40 overflow-auto rounded-lg border">
                      {clientResults.map((c) => (
                        <button
                          type="button"
                          key={c._id}
                          onClick={() => {
                            setForm((f) => ({ ...f, clientId: c._id }));
                            setClientQuery(c.name);
                            setClientResults([]);
                          }}
                          className={`block w-full text-left px-3 py-2 hover:bg-gray-50 ${
                            form.clientId === c._id ? "bg-blue-50" : ""
                          }`}
                        >
                          {c.name} <span className="text-gray-500 text-xs">
                            ({c.email || "no email"})
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // --- Add new client inline ---
                <div className="mt-2 grid gap-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Type</label>
                      <select
                        value={newClient.type}
                        onChange={(e) => setNewClient(v => ({ ...v, type: e.target.value }))}
                        className="w-full rounded-lg border px-3 py-2 bg-white"
                        required
                      >
                        {CLIENT_TYPES.map(t => (
                          <option key={t} value={t}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Name</label>
                      <input
                        placeholder="Full name / Organization"
                        value={newClient.name}
                        onChange={(e) => setNewClient(v => ({ ...v, name: e.target.value }))}
                        className="w-full rounded-lg border px-3 py-2"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={newClient.email}
                        onChange={(e) => setNewClient(v => ({ ...v, email: e.target.value }))}
                        className="w-full rounded-lg border px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Phone</label>
                      <input
                        placeholder="+9477xxxxxxx"
                        value={newClient.phone}
                        onChange={(e) => setNewClient(v => ({ ...v, phone: e.target.value }))}
                        className="w-full rounded-lg border px-3 py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Address</label>
                    <input
                      placeholder="Street, city"
                      value={newClient.address}
                      onChange={(e) => setNewClient(v => ({ ...v, address: e.target.value }))}
                      className="w-full rounded-lg border px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">District</label>
                    <select
                      value={newClient.district}
                      onChange={(e) => setNewClient(v => ({ ...v, district: e.target.value }))}
                      className="w-full rounded-lg border px-3 py-2 bg-white"
                      required
                    >
                      <option value="" disabled>Select district</option>
                      {SRI_LANKA_DISTRICTS?.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-1">
                    <button
                      type="button"
                      onClick={createClientInline}
                      className="w-full md:w-auto rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold"
                    >
                      Save client
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Court / Place */}
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Court</label>
                <select
                  name="courtType"
                  value={form.courtType}
                  onChange={onChange}
                  className="w-full rounded-lg border px-3 py-2 bg-white"
                  required
                >
                  {COURT_TYPES?.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Place</label>
                {fixedColombo ? (
                  <input value="Colombo" readOnly className="w-full rounded-lg border px-3 py-2 bg-gray-100" />
                ) : canPickDistrict ? (
                  <select
                    name="courtPlace"
                    value={form.courtPlace}
                    onChange={onChange}
                    required
                    className="w-full rounded-lg border px-3 py-2 bg-white"
                  >
                    <option value="" disabled>Select district</option>
                    {SRI_LANKA_DISTRICTS?.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                ) : canPickProvince ? (
                  <select
                    name="courtPlace"
                    value={form.courtPlace}
                    onChange={onChange}
                    required
                    className="w-full rounded-lg border px-3 py-2 bg-white"
                  >
                    <option value="" disabled>Select province</option>
                    {SRI_LANKA_PROVINCES?.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                ) : (
                  <input readOnly className="w-full rounded-lg border px-3 py-2 bg-gray-100" />
                )}
              </div>
            </div>

            {/* Status (display only) */}
            <div>
              <label className="block text-sm mb-1">Status</label>
              <input
                value="open"
                readOnly
                className="w-full rounded-lg border px-3 py-2 bg-gray-100 lowercase"
                style={{ textTransform: "capitalize" }}
              />
              <p className="mt-1 text-xs text-gray-500">
                Cases always start as open. You can close the case from the table.
              </p>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={onClose}
                    className="rounded-lg border px-4 py-2 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold">
              Create case
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}