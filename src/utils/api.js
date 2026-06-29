import { API_BASE_URL } from "../config/config";

const base = API_BASE_URL;

export const api = {
  async getRouters() {
    const res = await fetch(`${base}/api/routers`);
    if (!res.ok) throw new Error("Failed to fetch routers");
    return res.json();
  },

  async getRoutersByStatus(status) {
    const res = await fetch(`${base}/api/routers/status/${status}`);
    if (!res.ok) throw new Error("Failed to fetch routers by status");
    return res.json();
  },

  async getRouterLastEvents(ip) {
    const res = await fetch(`${base}/api/routers/${ip}/last-events`);
    if (!res.ok) throw new Error("Failed to fetch last events");
    return res.json();
  },

  async getRouter(ip) {
    const res = await fetch(`${base}/api/routers/${ip}`);
    if (!res.ok) throw new Error("Failed to fetch router");
    return res.json();
  },

  async getRouterHistory(ip, page = 1, limit = 1000) {
    const res = await fetch(`${base}/api/routers/${ip}/history?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch history");
    return res.json();
  },

  async getAnalytics(ip, period) {
    const res = await fetch(`${base}/api/analytics/summary/${ip}?period=${period}`);
    if (!res.ok) throw new Error("Failed to fetch analytics");
    return res.json();
  },

  // NEW: GET all BTS analytics
  async getAllAnalytics(period) {
    const res = await fetch(`${base}/api/analytics/all?period=${period}`);
    if (!res.ok) throw new Error("Failed to fetch all analytics");
    return res.json();
  },

  // NEW: Download excel report
  async downloadExcel(period) {
    const res = await fetch(`${base}/api/analytics/report/excel/${period}`);
    if (!res.ok) throw new Error("Failed to download report");
    return res.blob();
  },

  async ask(question) {
    const res = await fetch(`${base}/api/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) throw new Error("Failed to get answer");
    return res.json();
  },

  async addRouter(bts_name, ip_address) {
    const res = await fetch(`${base}/api/routers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bts_name, ip_address }),
    });
    if (!res.ok) throw new Error("Failed to add router");
    return res.json();
  },

  async updateRouter(ip, data) {
    const res = await fetch(`${base}/api/routers/${ip}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update router");
    return res.json();
  },

  async deleteRouter(ip) {
    const res = await fetch(`${base}/api/routers/${ip}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete router");
    return res.json();
  },
};