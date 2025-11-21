import { useEffect, useMemo, useState } from "react";
import NavbarDashboard from "../../components/NavbarDashboard.jsx";
import { SRI_LANKA_DISTRICTS } from "../../constants/districts.js";


const API = import.meta.env.VITE_API_URL;


export default function Clients() {
  const token = localStorage.getItem("token");


  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // filters
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);


  // modal
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);


  const emptyForm = useMemo(() => ({
    type: "individual",
    name: "",
    email: "",
    phone: "",
    address: "",
    district: "",
  }), []);


  const [form, setForm] = useState(emptyForm);


  // ---------- LOAD CLIENTS ----------
  const fetchClients = async () => {
    setLoading(true);
    setError("");


    try {
      const search = new URLSearchParams();
      if (q.trim()) search.set("q", q.trim());


      const res = await fetch(
        `${API}/api/clients${search.toString() ? `?${search}` : ""}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );


      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load clients");


      setItems(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => { fetchClients(); }, []);


  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [open]);


  // ---------- FILTER CLIENTS ----------
  const filtered = items.filter((c) =>
    (!typeFilter || c.type === typeFilter) &&
    (!districtFilter || c.district === districtFilter)
  );


  // ---------- MODAL ----------
  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };


  const openEdit = (client) => {
    setEditing(client);
    setForm({
      type: client.type ?? "individual",
      name: client.name ?? "",
      email: client.email ?? "",
      phone: client.phone ?? "",
      address: client.address ?? "",
      district: client.district ?? "",
    });
    setOpen(true);
  };


  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };


  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));


  const submitForm = async (e) => {
    e.preventDefault();
    setError("");


    try {
      const url = editing
        ? `${API}/api/clients/${editing._id}`
        : `${API}/api/clients`;
      const method = editing ? "PUT" : "POST";


      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });


      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed");


      closeModal();
      fetchClients();
    } catch (e) {
      setError(e.message);
    }
  };


  const removeClient = async (client) => {
    const ok = confirm(`Delete client "${client.name}"? This cannot be undone.`);
    if (!ok) return;


    try {
      const res = await fetch(`${API}/api/clients/${client._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });


      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Delete failed");


      fetchClients();
    } catch (e) {
      setError(e.message);
    }
  };


  // ---------- UI ----------
  return (
    <main className="min-h-screen bg-gray-50">
      <NavbarDashboard />


      <div className="mx-auto max-w-6xl px-4 py-8">


        {/* === STICKY HEADER === */}
        <div className="sticky top-0 z-40 bg-gray-50 pb-4 border-b border-gray-50">
          
          {/* Title + Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <h1 className="text-2xl font-bold">Clients</h1>
            <button
              onClick={openCreate}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold shadow hover:bg-blue-700"
            >
              + New client
            </button>
          </div>


          {/* Filter Box */}
          <div className="mt-6 bg-white rounded-xl border p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setFiltersOpen((prev) => !prev)}
                className="md:hidden rounded-md border px-3 py-1 text-sm"
              >
                {filtersOpen ? "Hide" : "Show"}
              </button>
            </div>

            <div className={`${filtersOpen ? "block" : "hidden"} md:block`}>
              
              {/* All filters in one row for desktop */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Search - takes more space */}
                <div className="md:col-span-5">
                  <label className="block text-sm font-medium mb-1">Search by name</label>
                  <div className="flex gap-2">
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="e.g., John"
                      className="flex-1 rounded-lg border px-3 py-2"
                    />
                    <button
                      onClick={fetchClients}
                      className="rounded-lg bg-black px-4 py-2 text-white font-semibold whitespace-nowrap"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {/* Client Type */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Client type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 bg-white"
                  >
                    <option value="">All</option>
                    <option value="individual">Individual</option>
                    <option value="organization">Organization</option>
                    <option value="company">Company</option>
                    <option value="government">Government</option>
                  </select>
                </div>

                {/* District */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium mb-1">District</label>
                  <select
                    value={districtFilter}
                    onChange={(e) => setDistrictFilter(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 bg-white"
                  >
                    <option value="">All</option>
                    {SRI_LANKA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Reset Button */}
                <div className="md:col-span-2 flex items-end">
                  <button
                    onClick={() => {
                      setQ("");
                      setTypeFilter("");
                      setDistrictFilter("");
                      fetchClients();
                    }}
                    className="w-full rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 whitespace-nowrap"
                  >
                    Reset filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>


        {error && <p className="mt-4 text-red-600">{error}</p>}


        {/* ------------------ LIST SECTION ------------------ */}
        <div className="mt-2 relative z-0">


          {/* MOBILE CARD VIEW */}
          <div className="space-y-3 md:hidden">
            {loading ? (
              <p className="text-gray-500 text-center py-6">Loading…</p>
            ) : filtered.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No clients match your filters.</p>
            ) : (
              filtered.map((c) => (
                <div key={c._id} className="rounded-xl border bg-white p-4 shadow-sm">
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{c.type}</p>


                  <div className="mt-2 text-sm">
                    <p><span className="font-medium">Email:</span> {c.email || "—"}</p>
                    <p><span className="font-medium">Phone:</span> {c.phone || "—"}</p>
                    <p><span className="font-medium">District:</span> {c.district || "—"}</p>
                  </div>


                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => openEdit(c)}
                      className="flex-1 rounded-lg border px-3 py-2 font-medium hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeClient(c)}
                      className="flex-1 rounded-lg border px-3 py-2 font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>


          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3 w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-6">Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">No clients match your filters.</td></tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c._id} className="border-t">
                      <td className="px-4 py-3 capitalize">{c.type}</td>
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3">{c.email || "—"}</td>
                      <td className="px-4 py-3">{c.phone || "—"}</td>
                      <td className="px-4 py-3">{c.district || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(c)} className="rounded-md border px-3 py-1 hover:bg-gray-50">Edit</button>
                          <button onClick={() => removeClient(c)} className="rounded-md border px-3 py-1 text-red-600 hover:bg-red-50">Delete</button>
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


      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{editing ? "Edit client" : "New client"}</h2>
              <button onClick={closeModal} className="rounded-md p-1 hover:bg-gray-100">✕</button>
            </div>
            <form onSubmit={submitForm} className="mt-4 grid gap-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Type</label>
                  <select name="type" value={form.type} onChange={onChange} className="w-full rounded-lg border px-3 py-2 bg-white">
                    <option value="individual">Individual</option>
                    <option value="company">Company</option>
                    <option value="government">Government</option>
                    <option value="organization">Organization</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Name</label>
                  <input name="name" value={form.name} onChange={onChange} className="w-full rounded-lg border px-3 py-2" required />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Email</label>
                  <input type="email" name="email" value={form.email} onChange={onChange} className="w-full rounded-lg border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Phone</label>
                  <input name="phone" value={form.phone} onChange={onChange} className="w-full rounded-lg border px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Address</label>
                <input name="address" value={form.address} onChange={onChange} className="w-full rounded-lg border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm mb-1">District</label>
                <select name="district" value={form.district} onChange={onChange} className="w-full rounded-lg border px-3 py-2 bg-white">
                  <option value="" disabled>Select district</option>
                  {SRI_LANKA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={closeModal} className="rounded-lg border px-4 py-2 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold">{editing ? "Save changes" : "Create client"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
