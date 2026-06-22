import React, { useState, useEffect, useCallback } from "react";
import { api } from "../utils/api";

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h3 className="text-white font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function AdminPage({ onBack }) {
  const [routers, setRouters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  // Modals
  const [addModal, setAddModal] = useState(false);
  const [editRouter, setEditRouter] = useState(null);
  const [deleteRouter, setDeleteRouter] = useState(null);

  // Form state
  const [form, setForm] = useState({ bts_name: "", ip_address: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRouters = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getRouters();
      const arr = Array.isArray(data) ? data : data.data || data.routers || [];
      setRouters(arr);
    } catch (e) {
      showToast("Failed to load routers: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRouters(); }, [fetchRouters]);

  const filtered = routers.filter(r =>
    r.bts_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.ip_address?.includes(search)
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleAdd(e) {
    e.preventDefault();
    setFormError("");
    if (!form.bts_name.trim() || !form.ip_address.trim()) {
      setFormError("Both fields are required");
      return;
    }
    setFormLoading(true);
    try {
      await api.addRouter(form.bts_name.trim(), form.ip_address.trim());
      setAddModal(false);
      setForm({ bts_name: "", ip_address: "" });
      showToast("BTS added successfully");
      fetchRouters();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    try {
      await api.updateRouter(editRouter.ip_address, { bts_name: form.bts_name, ip_address: form.ip_address });
      setEditRouter(null);
      showToast("BTS updated successfully");
      fetchRouters();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete() {
    setFormLoading(true);
    try {
      await api.deleteRouter(deleteRouter.ip_address);
      setDeleteRouter(null);
      showToast("BTS deleted successfully");
      fetchRouters();
    } catch (e) {
      showToast("Delete failed: " + e.message, "error");
    } finally {
      setFormLoading(false);
    }
  }

  function openEdit(r) {
    setForm({ bts_name: r.bts_name, ip_address: r.ip_address });
    setFormError("");
    setEditRouter(r);
  }

  function openAdd() {
    setForm({ bts_name: "", ip_address: "" });
    setFormError("");
    setAddModal(true);
  }

  return (
    <div className="min-h-screen bg-[#080c18] text-white">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-semibold transition-all ${
          toast.type === "error"
            ? "bg-red-500/20 border-red-500/40 text-red-300"
            : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
        }`}>
          {toast.type === "error"
            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          }
          {toast.msg}
        </div>
      )}

      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-[#0a0e1a]/95 backdrop-blur border-b border-amber-800/30">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <div className="text-base font-black tracking-tight" style={{ fontFamily: "'Rajdhani', sans-serif" }}>ADMIN PANEL</div>
              <div className="text-[10px] text-amber-500 tracking-wider">BTS MANAGEMENT</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search BTS or IP..."
                  className="bg-slate-800/60 border border-slate-700/50 text-white rounded-xl pl-10 pr-4 py-2 text-sm w-64 focus:outline-none focus:border-amber-500/50 placeholder-slate-500" />
              </div>
            </div>

            <button onClick={openAdd}
              className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl px-3 py-2 text-xs font-bold transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add BTS
            </button>

            <button onClick={onBack}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white rounded-xl px-3 py-2 text-xs font-semibold transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        {/* Summary */}
        <div className="flex items-center gap-4 mb-5">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2">
            <span className="text-amber-400 font-bold">{routers.length}</span>
            <span className="text-slate-400 text-sm ml-1">total BTS</span>
          </div>
          {search && (
            <div className="bg-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300">
              {filtered.length} matching "{search}"
            </div>
          )}
        </div>

        {/* Mobile search */}
        <div className="sm:hidden mb-4">
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search BTS or IP..."
            className="w-full bg-slate-800/60 border border-slate-700/50 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder-slate-500" />
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/40 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-semibold">#</th>
                  <th className="text-left px-5 py-3 font-semibold">BTS Name</th>
                  <th className="text-left px-5 py-3 font-semibold">IP Address</th>
                  <th className="text-center px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-16">
                    <svg className="w-8 h-8 animate-spin text-amber-400 mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  </td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-16 text-slate-500">
                    {search ? "No BTS found" : "No routers configured"}
                  </td></tr>
                ) : paginated.map((r, i) => (
                  <tr key={r.ip_address} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-white font-medium">{r.bts_name}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-amber-400/80 text-xs bg-slate-800/60 px-2 py-1 rounded-lg">{r.ip_address}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(r)}
                          className="flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 text-blue-400 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          Update
                        </button>
                        <button onClick={() => setDeleteRouter(r)}
                          className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800">
              <span className="text-slate-400 text-sm">Page {page} of {totalPages}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  ← Prev
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {addModal && (
        <Modal title="Add New BTS" onClose={() => setAddModal(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">BTS Name</label>
              <input type="text" value={form.bts_name} onChange={e => setForm(f => ({ ...f, bts_name: e.target.value }))}
                placeholder="e.g. Dhaka-Mirpur-BTS-001"
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/70 placeholder-slate-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">IP Address</label>
              <input type="text" value={form.ip_address} onChange={e => setForm(f => ({ ...f, ip_address: e.target.value }))}
                placeholder="e.g. 192.168.1.100"
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/70 placeholder-slate-500" />
            </div>
            {formError && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">{formError}</div>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setAddModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl py-2.5 text-sm font-semibold transition-all">
                Cancel
              </button>
              <button type="submit" disabled={formLoading}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl py-2.5 text-sm font-bold disabled:opacity-50 transition-all">
                {formLoading ? "Adding..." : "Add BTS"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {editRouter && (
        <Modal title="Update BTS" onClose={() => setEditRouter(null)}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">BTS Name</label>
              <input type="text" value={form.bts_name} onChange={e => setForm(f => ({ ...f, bts_name: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/70" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">IP Address</label>
              <input type="text" value={form.ip_address} onChange={e => setForm(f => ({ ...f, ip_address: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/70" />
            </div>
            {formError && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">{formError}</div>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditRouter(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl py-2.5 text-sm font-semibold transition-all">
                Cancel
              </button>
              <button type="submit" disabled={formLoading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl py-2.5 text-sm font-bold disabled:opacity-50 transition-all">
                {formLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {deleteRouter && (
        <Modal title="Confirm Delete" onClose={() => setDeleteRouter(null)}>
          <div className="space-y-5">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-300 text-sm">This will permanently delete the router and ALL its ping history. This action cannot be undone.</p>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-1">BTS Name</p>
              <p className="text-white font-semibold">{deleteRouter.bts_name}</p>
              <p className="text-slate-400 text-xs mt-2 mb-1">IP Address</p>
              <p className="text-amber-400 font-mono text-sm">{deleteRouter.ip_address}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteRouter(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl py-2.5 text-sm font-semibold transition-all">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={formLoading}
                className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl py-2.5 text-sm font-bold disabled:opacity-50 transition-all">
                {formLoading ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
