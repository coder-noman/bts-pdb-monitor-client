import React, { useState } from "react";
import { API_BASE_URL } from "../config/config";
import logo from "../../assets/logo.svg";

function fmt(seconds) {
  if (!seconds && seconds !== 0) return "—";
  const totalMinutes = Math.floor(seconds / 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0 && m === 0) return "0min";
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function formatTimeOnlyBD(utcString) {
  if (!utcString) return "—";
  try {
    return new Date(utcString).toLocaleTimeString("en-BD", {
      timeZone: "Asia/Dhaka",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
}

// ── Single BTS Date Modal ─────────────────────────────────────────────────────
function BtsDetailModal({ ip, date, btsName, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/analytics/date/${date}/${ip}`,
        );
        if (!res.ok) throw new Error("Failed to fetch data");
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ip, date]);

  const summary = data?.summary || data;
  const events = data?.events || data?.cycles || data?.history || [];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700 shrink-0">
          <div>
            <h2 className="text-white font-bold text-base">{btsName}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="font-mono text-cyan-400/80 text-xs bg-slate-800/60 px-2 py-1 rounded-lg">
                {ip}
              </span>
              <span className="text-slate-500 text-xs">{date}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <svg
                className="w-8 h-8 animate-spin text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          ) : error ? (
            <div className="text-center text-red-400 py-8">{error}</div>
          ) : (
            <>
              {/* Summary — single line cards, no Monitored */}
              {summary && (
                <div className="flex flex-wrap gap-3 mb-5">
                  {[
                    {
                      label: "Up Time",
                      value: fmt(summary.up_seconds ?? summary.up_time),
                      color: "emerald",
                    },
                    {
                      label: "Down Time",
                      value: fmt(summary.down_seconds ?? summary.down_time),
                      color: "red",
                    },
                    {
                      label: "Up Time %",
                      value: `${parseFloat(summary.uptime_pct ?? 0).toFixed(1)}%`,
                      color: "blue",
                    },
                    {
                      label: "Down Time %",
                      value: `${parseFloat(summary.downtime_pct ?? 0).toFixed(1)}%`,
                      color: "orange",
                    },
                    {
                      label: "Total Down",
                      value: summary.down_incidents ?? "—",
                      color: "rose",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 flex items-center gap-3"
                    >
                      <span className="text-slate-400 text-xs font-semibold">
                        {s.label}
                      </span>
                      <span
                        className={`text-${s.color}-400 font-black text-sm`}
                      >
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Events table — no Monitored, no Uptime 24h, no Downtime 24h, no Time */}
              {events.length > 0 ? (
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-slate-700/50 flex items-center justify-between">
                    <span className="text-white font-semibold text-sm">
                      Events
                    </span>
                    <span className="text-slate-500 text-xs">
                      {events.length} records
                    </span>
                  </div>
                  <div
                    className="overflow-auto"
                    style={{ maxHeight: "calc(90vh - 200px)" }}
                  >
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                          <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">
                            #
                          </th>
                          <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">
                            Status
                          </th>
                          <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">
                            Up Time
                          </th>
                          <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">
                            Down Time
                          </th>
                          <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">
                            Duration
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {events.map((h, i) => {
                          const isFirst = i === 0;
                          let duration = "—";
                          if (isFirst && h.started_at) {
                            duration = `${formatTimeOnlyBD(h.started_at)} –`;
                          } else if (h.started_at && h.ended_at) {
                            duration = `${formatTimeOnlyBD(h.started_at)} – ${formatTimeOnlyBD(h.ended_at)}`;
                          } else if (h.started_at) {
                            duration = `${formatTimeOnlyBD(h.started_at)} –`;
                          }
                          return (
                            <tr
                              key={h.id || i}
                              className="hover:bg-slate-800/40 transition-colors"
                            >
                              <td className="px-4 py-2.5 text-slate-500 font-mono text-xs">
                                {i + 1}
                              </td>
                              <td className="px-4 py-2.5">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    h.status === "Up"
                                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                      : "bg-red-500/15 text-red-400 border border-red-500/20"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${h.status === "Up" ? "bg-emerald-400" : "bg-red-400"}`}
                                  />
                                  {h.status}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-emerald-400/80 font-mono text-xs">
                                {fmt(h.up_time)}
                              </td>
                              <td className="px-4 py-2.5 text-red-400/80 font-mono text-xs">
                                {fmt(h.down_time)}
                              </td>
                              <td className="px-4 py-2.5 text-slate-300 text-xs font-mono">
                                {duration}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 py-8">
                  No events found for this date
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Reports Page ──────────────────────────────────────────────────────────────
export default function ReportsPage({ onBack }) {
  const [dateInput, setDateInput] = useState("");
  const [btsSearch, setBtsSearch] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchedDate, setSearchedDate] = useState("");
  const [selectedBts, setSelectedBts] = useState(null);

  // function toApiDate(input) {
  //   return input.trim().replace(/\//g, "-");
  // }
  function toApiDate(input) {
  return input.trim(); 
}

  function toDisplayDate(apiDate) {
    if (!apiDate) return "";
    try {
      return new Date(apiDate + "T00:00:00").toLocaleDateString("en-BD", {
        timeZone: "Asia/Dhaka",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return apiDate;
    }
  }

  async function handleDateSearch(e) {
    if (e.key && e.key !== "Enter") return;
    const raw = dateInput.trim();
    if (!raw) return;
    const apiDate = toApiDate(raw);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(apiDate)) {
      setError("Please enter date in format: 2026/06/01");
      return;
    }
    setLoading(true);
    setError("");
    setData(null);
    setBtsSearch("");
    setSearchedDate(apiDate);
    try {
      const res = await fetch(`${API_BASE_URL}/api/analytics/date/${apiDate}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      const arr = Array.isArray(json)
        ? json
        : json.data || json.routers || json.analytics || [];
      // Sort: highest downtime first, then lowest uptime
      const sorted = [...arr].sort((a, b) => {
        const aDown = a.down_seconds ?? a.down_time ?? 0;
        const bDown = b.down_seconds ?? b.down_time ?? 0;
        const aUp = a.up_seconds ?? a.up_time ?? 0;
        const bUp = b.up_seconds ?? b.up_time ?? 0;
        if (bDown !== aDown) return bDown - aDown;
        return aUp - bUp;
      });
      setData(sorted);
    } catch (e) {
      setError("Failed to fetch data: " + e.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = (data || []).filter(
    (r) =>
      r.bts_name?.toLowerCase().includes(btsSearch.toLowerCase()) ||
      r.ip_address?.includes(btsSearch),
  );

  return (
    <div className="min-h-screen bg-[#080c18] text-white flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-[#0a0e1a]/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand with logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-16 h-16 flex items-center justify-center">
              <img src={logo} alt="Logo" width={50} height={50} />
            </div>
            <div>
              <div
                className="text-base font-black tracking-tight"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                BTS PDB REPORTS
              </div>
              <div className="text-[10px] text-indigo-400 tracking-wider">
                DATE-WISE ANALYTICS
              </div>
            </div>
          </div>

          {/* Two search bars */}
          <div className="flex-1 flex items-center gap-3 max-w-2xl">
            {/* Left — BTS search */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={btsSearch}
                onChange={(e) => setBtsSearch(e.target.value)}
                placeholder="Search BTS name or IP..."
                disabled={!data}
                className="w-full bg-slate-800/60 border border-slate-700/50 text-white rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500/50 placeholder-slate-500 disabled:opacity-40 transition-all"
              />
            </div>

            {/* Right — Date search */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {/* <input
                type="text"
                value={dateInput}
                onChange={e => setDateInput(e.target.value)}
                onKeyDown={handleDateSearch}
                placeholder="2026/06/01 — press Enter"
                className="w-full bg-slate-800/60 border border-slate-700/50 text-white rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500/50 placeholder-slate-500 transition-all"
              /> */}
              <input
                type="date"
                value={dateInput}
                onChange={(e) => {
                  setDateInput(e.target.value);
                }}
                onKeyDown={handleDateSearch}
                max={new Date().toISOString().split("T")[0]}
                className="w-full bg-slate-800/60 border border-slate-700/50 text-white rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500/50 transition-all [color-scheme:dark]"
              />
            </div>

            <button
              onClick={handleDateSearch}
              disabled={loading || !dateInput.trim()}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
            >
              {loading ? "..." : "Search"}
            </button>
          </div>

          {/* Back */}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white rounded-xl px-3 py-2 text-xs font-semibold transition-all shrink-0"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Dashboard
          </button>
        </div>
      </nav>

      {/* Content — flex-1 so it fills remaining height, no blank space */}
      <div className="flex-1 flex flex-col max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5 text-red-400 text-sm">
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        )}

        {/* No search yet */}
        {data === null && !loading && !error && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-slate-400 text-base font-semibold">
                For get information Search by date
              </p>
              <p className="text-slate-600 text-sm mt-1">
                Enter date in format: 2026/06/01 and press Enter or Search
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-10 h-10 animate-spin text-indigo-400 mx-auto mb-3"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p className="text-slate-400 text-sm">
                Loading report for {searchedDate}...
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && data !== null && (
          <>
            {/* Date header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-2">
                <svg
                  className="w-4 h-4 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-indigo-400 font-bold text-sm">
                  {toDisplayDate(searchedDate)}
                </span>
              </div>
              {data.length > 0 && (
                <span className="text-slate-400 text-sm">
                  <span className="text-white font-bold">
                    {filtered.length}
                  </span>{" "}
                  BTS found
                </span>
              )}
            </div>

            {/* No data */}
            {data.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-7 h-7 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-slate-400 font-semibold">
                    No data found in this date.
                  </p>
                  <p className="text-slate-600 text-sm mt-1">
                    Try a different date
                  </p>
                </div>
              </div>
            ) : (
              /* Table — fills all remaining space, no blank gap at bottom */
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden flex flex-col flex-1 min-h-0">
                <div
                  className="overflow-auto flex-1"
                  style={{ maxHeight: "calc(100vh - 170px)" }}
                >
                  <table
                    className="w-full text-sm"
                    style={{ minWidth: "900px" }}
                  >
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                        <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                          #
                        </th>
                        <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                          BTS Name
                        </th>
                        <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                          IP Address
                        </th>
                        <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                          Up Time
                        </th>
                        <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                          Down Time
                        </th>
                        <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                          Monitored Time
                        </th>
                        <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                          Up Time %
                        </th>
                        <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                          Down Time %
                        </th>
                        <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                          Total Down
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filtered.length === 0 ? (
                        <tr>
                          <td
                            colSpan={9}
                            className="text-center py-10 text-slate-500"
                          >
                            No BTS matching "{btsSearch}"
                          </td>
                        </tr>
                      ) : (
                        filtered.map((r, i) => {
                          const upSec = r.up_seconds ?? r.up_time ?? 0;
                          const downSec = r.down_seconds ?? r.down_time ?? 0;
                          // Monitored = uptime + downtime
                          const monitoredSec = upSec + downSec;
                          return (
                            <tr
                              key={r.ip_address || i}
                              onClick={() => setSelectedBts(r)}
                              className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                            >
                              <td className="px-4 py-3.5 text-slate-500 font-mono text-xs">
                                {i + 1}
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="text-white font-medium group-hover:text-indigo-400 transition-colors">
                                  {r.bts_name}
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="font-mono text-cyan-400/80 text-xs bg-slate-800/60 px-2 py-1 rounded-lg">
                                  {r.ip_address}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-emerald-400 font-mono text-xs">
                                {fmt(upSec)}
                              </td>
                              <td className="px-4 py-3.5">
                                <span
                                  className={`font-mono text-xs ${downSec > 0 ? "text-red-400" : "text-slate-500"}`}
                                >
                                  {fmt(downSec)}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-violet-400/80 font-mono text-xs">
                                {fmt(monitoredSec)}
                              </td>
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-slate-700 rounded-full h-1.5">
                                    <div
                                      className="bg-emerald-400 h-1.5 rounded-full"
                                      style={{
                                        width: `${Math.min(parseFloat(r.uptime_pct || 0), 100)}%`,
                                      }}
                                    />
                                  </div>
                                  <span className="text-blue-400 font-bold text-xs">
                                    {parseFloat(r.uptime_pct ?? 0).toFixed(1)}%
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3.5">
                                <span
                                  className={`font-bold text-xs ${parseFloat(r.downtime_pct || 0) > 10 ? "text-red-400" : parseFloat(r.downtime_pct || 0) > 0 ? "text-orange-400" : "text-slate-500"}`}
                                >
                                  {parseFloat(r.downtime_pct ?? 0).toFixed(1)}%
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                {(r.down_incidents || 0) > 0 ? (
                                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400 font-bold text-sm">
                                    {r.down_incidents}
                                  </span>
                                ) : (
                                  <span className="text-slate-500 text-xs">
                                    —
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* BTS Detail Modal */}
      {selectedBts && (
        <BtsDetailModal
          ip={selectedBts.ip_address}
          date={searchedDate}
          btsName={selectedBts.bts_name}
          onClose={() => setSelectedBts(null)}
        />
      )}
    </div>
  );
}
