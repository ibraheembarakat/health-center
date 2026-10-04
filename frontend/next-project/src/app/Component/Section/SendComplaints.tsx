"use client";

import { useState } from "react";

function SendComplaints() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch(
        "http://localhost:8000/api/complaints/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: "success",
          message: "Complaint sent successfully. We will review it shortly.",
        });
        setTitle("");
        setDescription("");
      } else {
        setStatus({
          type: "error",
          message: data.message || "Failed to submit complaint. Please try again.",
        });
      }
    } catch (error) {
      console.error(error);
      setStatus({
        type: "error",
        message: "Failed to connect to the server. Check your internet connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 bg-white rounded-3xl shadow-xl border border-slate-100/80 transition-all duration-300">
      {/* Header Section */}
      <div className="mb-6 text-center">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl shadow-inner">
          📝
        </div>
        <h2 className="text-2xl font-bold text-slate-800">
          Submit a Complaint
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Have an issue or feedback? Send us the details and we will look into it.
        </p>
      </div>

      {/* Status Notification Banner */}
      {status && (
        <div
          className={`mb-6 p-4 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-3 transition-all animate-fadeIn ${
            status.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          <span>{status.type === "success" ? "✅" : "⚠️"}</span>
          <span>{status.message}</span>
        </div>
      )}

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Complaint Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Service delay, App issue..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition duration-200 text-slate-800 placeholder-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Description *
          </label>
          <textarea
            required
            rows={5}
            placeholder="Provide a detailed explanation of your complaint..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-4 text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition duration-200 text-slate-800 placeholder-slate-400 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin text-base">⏳</span>
              <span>Sending Complaint...</span>
            </>
          ) : (
            "Submit Complaint"
          )}
        </button>
      </form>
    </div>
  );
}

export default SendComplaints;