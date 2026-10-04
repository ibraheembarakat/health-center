"use client";

import { useEffect, useState } from "react";

interface Complaint {
  id: number;
  user_name: string;
  title: string;
  description: string;
}

function HelpDeskSection() {
  const [data, setData] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openReply, setOpenReply] = useState<number | null>(null);
  const [reply, setReply] = useState<{ [key: number]: string }>({});
  const [sendingId, setSendingId] = useState<number | null>(null);

  useEffect(() => {
    const getComplaints = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");

        const res = await fetch(
          "http://localhost:8000/api/complaints/?status=pending",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch complaints");

        const result = await res.json();
        setData(result.results || []);
      } catch (error) {
        console.error("Error fetching complaints:", error);
      } finally {
        setLoading(false);
      }
    };

    getComplaints();
  }, []);

  const sendReply = async (id: number) => {
    if (!reply[id]?.trim()) return;

    const token = localStorage.getItem("accessToken");

    try {
      setSendingId(id);
      const res = await fetch(
        `http://localhost:8000/api/complaints/${id}/reply/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true"
          },
          body: JSON.stringify({
            reply: reply[id],
          }),
        }
      );

      if (res.ok) {
        // Remove the answered complaint from the list
        setData((prev) => prev.filter((item) => item.id !== id));
        setOpenReply(null);
        setReply((prev) => ({
          ...prev,
          [id]: "",
        }));
      } else {
        alert("Can't send, sorry!");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setSendingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium text-sm">
          Loading complaints and requests...
        </p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-xs">
        <span className="text-4xl block mb-2">🎉</span>
        <h3 className="text-lg font-bold text-slate-800">
          No pending complaints
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          All complaints have been processed or there are no new requests at
          the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 dir-rtl" dir="rtl">
      {data.map((item) => {
        const isReplying = openReply === item.id;

        return (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md hover:shadow-xl transition-all duration-200"
          >
            {/* Header / User Info */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base">
                  {item.user_name ? item.user_name.charAt(0).toUpperCase() : "👤"}
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 text-base leading-tight">
                    {item.user_name || "user"}
                  </h2>
                  <span className="text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-semibold mt-0.5 inline-block">
                    Pending
                  </span>
                </div>
              </div>

              <button
                onClick={() => setOpenReply(isReplying ? null : item.id)}
                className={`px-4 py-2 rounded-xl font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  isReplying
                    ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                }`}
              >
                <span>{isReplying ? "Cancel" : "Reply to complaint"}</span>
                <span>{isReplying ? "✕" : "💬"}</span>
              </button>
            </div>

            {/* Complaint Content */}
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-800">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                {item.description}
              </p>
            </div>

            {/* Reply Input Section */}
            {isReplying && (
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-3 animate-fadeIn">
                <label className="block text-xs font-semibold text-slate-600">
                  Write the answer:
                </label>
                <textarea
                  placeholder="Write the answer here"
                  className="w-full border border-slate-200 rounded-2xl p-4 text-sm text-slate-800 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition leading-relaxed placeholder-slate-400 min-h-[120px] resize-y"
                  rows={4}
                  value={reply[item.id] || ""}
                  onChange={(e) =>
                    setReply({
                      ...reply,
                      [item.id]: e.target.value,
                    })
                  }
                />

                <div className="flex justify-end">
                  <button
                    onClick={() => sendReply(item.id)}
                    disabled={sendingId === item.id || !reply[item.id]?.trim()}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                  >
                    {sendingId === item.id ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      "Send the Answer"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default HelpDeskSection;