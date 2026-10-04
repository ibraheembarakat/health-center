"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function Page() {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `http://localhost:8000/api/articles/${id}/`,
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        if (!res.ok) throw new Error();

        const data = await res.json();

        setTitle(data.title);
        setContent(data.content);
      } catch (err) {
        setError("Failed to load article details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchArticle();
  }, [id]);

  const handleUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("accessToken");

      const res = await fetch(
        `http://localhost:8000/api/articles/${id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            title,
            content,
          }),
        }
      );

      if (!res.ok) throw new Error();

      router.push("/health");
    } catch (err) {
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium text-sm">Loading Article...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 flex justify-center items-start">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-10 space-y-6 transition-all">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✏️</span>
              <h1 className="text-2xl font-bold text-slate-800">Edit Article</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Update the article content and publish your changes to the health section.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 active:scale-95 transition text-center cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-sm font-medium flex items-center gap-2 animate-fadeIn">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Editor Form */}
        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Article Title *
            </label>
            <input
              type="text"
              required
              className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 font-semibold text-lg bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-slate-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a compelling article title..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Article Content *
            </label>
            <textarea
              required
              rows={14}
              className="w-full border border-slate-200 rounded-2xl p-5 text-slate-800 text-base bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition leading-relaxed placeholder-slate-400 resize-y min-h-[300px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the full content of the article here..."
            />
          </div>
        </form>

      </div>
    </div>
  );
}