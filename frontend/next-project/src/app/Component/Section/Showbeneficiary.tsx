"use client";

import { useEffect, useState } from "react";

interface Beneficiary {
  id: number;
  user_id: number;
  username: string;
  full_name: string;
  nutrition_status: string;
  total_scheduled: number;
  total_received: number;
  last_received_date: string | null;
}

function Showbeneficiary() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [scheduleDate, setScheduleDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch real data from Backend API
  useEffect(() => {
    const fetchBeneficiaries = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");

        const response = await fetch(
          "http://localhost:8000/api/beneficiaries/list/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || "Failed to fetch beneficiaries");
        }

        setBeneficiaries(Array.isArray(data) ? data : data.results || []);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch (error: any) {
        console.error("Beneficiaries Error:", error);
        setStatusMessage({
          type: "error",
          text: error?.message || "Failed to load beneficiaries list.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBeneficiaries();
  }, []);

  // Selection handlers
  const toggleBeneficiary = (userId: number) => {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === beneficiaries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(beneficiaries.map((b) => b.id));
    }
  };

  // Dispatch Notification API
  const sendNotification = async () => {
    setStatusMessage(null);

    if (selectedIds.length === 0) {
      setStatusMessage({
        type: "error",
        text: "Please select at least one beneficiary.",
      });
      return;
    }

    if (!scheduleDate) {
      setStatusMessage({
        type: "error",
        text: "Please specify the schedule date and time.",
      });
      return;
    }

    setSending(true);

    try {
      const accessToken = localStorage.getItem("accessToken");

      const response = await fetch(
        "http://localhost:8000/api/aid-schedules/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            beneficiaries: selectedIds,
            schedule_date: scheduleDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to schedule notification.");
      }

      setStatusMessage({
        type: "success",
        text: "Notification scheduled successfully!",
      });

      setSelectedIds([]);
      setScheduleDate("");
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (error: any) {
      console.error("Notification Error:", error);
      setStatusMessage({
        type: "error",
        text: error?.message || "Error occurred while scheduling notification.",
      });
    } finally {
      setSending(false);
    }
  };

  const formatStatus = (status: string) => {
    if (!status) return "N/A";
    return status.replace(/_/g, " ").toLowerCase();
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/60 py-8 px-4 sm:px-8 lg:px-12 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              Beneficiary Outreach
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Beneficiary Notifications
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Manage aid delivery schedules and track nutritional support history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3 text-center">
              <span className="block text-2xl font-black text-emerald-700">
                {beneficiaries.length}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                Total Listed
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-3 transition-all animate-bounce ${statusMessage.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-rose-50 border border-rose-200 text-rose-800"
              }`}
          >
            <span>{statusMessage.type === "success" ? "✅" : "⚠️"}</span>
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Schedule Controls */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
              <span>📅</span> Schedule Aid Notification
            </h2>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {selectedIds.length} Selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="sm:col-span-2">
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 rounded-2xl px-4 py-3 text-slate-800 text-sm font-medium transition-all outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={sendNotification}
              disabled={sending}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3.5 rounded-2xl transition-all duration-200 shadow-md shadow-emerald-600/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {sending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <span>Schedule Notification</span>
                  <span>🚀</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Table Container with Horizontal Scroll */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 font-medium text-sm">
              Loading beneficiaries data from server...
            </p>
          </div>
        ) : beneficiaries.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center">
            <span className="text-4xl block mb-2">📭</span>
            <p className="text-slate-600 font-bold">No beneficiaries found</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">

            {/* Table Header Controls */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={
                    beneficiaries.length > 0 &&
                    selectedIds.length === beneficiaries.length
                  }
                  onChange={selectAll}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Select All
                </span>
              </label>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-[11px] font-semibold text-slate-400">
                  ↔️ Scroll horizontally to view all fields
                </span>
                <span className="text-xs font-bold text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-full">
                  {beneficiaries.length} Records
                </span>
              </div>
            </div>

            {/* 🛑 HORIZONTAL SCROLL WRAPPER 🛑 */}
            <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300">
              <table className="w-full min-w-[850px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/30 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    <th className="py-4 px-6 w-12 text-center">Select</th>
                    <th className="py-4 px-4 w-12">#</th>
                    <th className="py-4 px-6">Full Name</th>
                    <th className="py-4 px-6">Username</th>
                    <th className="py-4 px-6">Nutritional Status</th>
                    <th className="py-4 px-4 text-center">Scheduled</th>
                    <th className="py-4 px-4 text-center">Received</th>
                    <th className="py-4 px-6">Last Received Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium whitespace-nowrap">
                  {beneficiaries.map((b, index) => {
                    const isSelected = selectedIds.includes(b.id);
                    return (
                      <tr
                        key={b.id}
                        className={`transition-colors duration-150 hover:bg-slate-50/80 ${isSelected ? "bg-emerald-50/40" : ""
                          }`}
                      >
                        <td className="py-4 px-6 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleBeneficiary(b.id)}
                            className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                          />
                        </td>
                        <td className="py-4 px-4 text-slate-400 font-bold text-xs">
                          {index + 1}
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-800">
                          {b.full_name}
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-slate-500">
                          @{b.username}
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 border border-amber-200 text-amber-800 capitalize">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {formatStatus(b.nutrition_status)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center font-semibold text-slate-700">
                          {b.total_scheduled}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${b.total_received > 0
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-500"
                              }`}
                          >
                            {b.total_received}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-500 text-xs font-medium">
                          {b.last_received_date || "Not received yet"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default Showbeneficiary;