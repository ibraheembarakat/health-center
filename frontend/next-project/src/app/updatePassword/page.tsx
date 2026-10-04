"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function UpdatePasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [uid, setUid] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // جلب UID و Token تلقائياً من رابط الـ URL إن وُجدا
  useEffect(() => {
    const urlUid = searchParams.get("uid");
    const urlToken = searchParams.get("token");

    if (urlUid) setUid(urlUid);
    if (urlToken) setToken(urlToken);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // التحقق من تطابق كلمتي المرور
    if (newPassword !== confirmPassword) {
      setMessage({
        text: "كلمتا المرور غير متطابقتين",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8000/api/auth/password-reset-confirm/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            uid,
            token,
            new_password: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "فشل تحديث كلمة المرور، يرجى التأكد من البيانات."
        );
      }

      setMessage({
        text: "تم تحديث كلمة المرور بنجاح! جاري التوجيه لتسجيل الدخول...",
        type: "success",
      });

      // التوجيه لصفحة تسجيل الدخول بعد 2 ثانية
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setMessage({
        text: err.message || "حدث خطأ غير متوقع",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center bg-slate-50 px-4 py-8"
      dir="rtl"
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
            🔑
          </div>

          <h1 className="text-2xl font-bold text-slate-800">
            تحديث كلمة المرور
          </h1>

          <p className="text-xs sm:text-sm text-slate-500">
            أدخل كلمة المرور الجديدة الخاصة بحسابك لإتمام الاستعادة
          </p>
        </div>

        {/* Alert Banner */}
        {message && (
          <div
            className={`p-4 rounded-2xl text-xs sm:text-sm font-medium border flex items-center gap-2 animate-fadeIn ${message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
          >
            <span>
              {message.type === "success" ? "✅" : "⚠️"}
            </span>

            <span>{message.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* UID Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              معرّف المستخدم (UID) *
            </label>
            <input
              type="text"
              placeholder="أدخل الـ UID"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-slate-400"
              required
            />
          </div>

          {/* Token Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              رمز التحقق (Token) *
            </label>

            <input
              type="text"
              placeholder="أدخل الـ Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-slate-400"
              required
            />
          </div>

          {/* New Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              كلمة المرور الجديدة *
            </label>

            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-slate-400"
              required
            />
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              تأكيد كلمة المرور الجديدة *
            </label>

            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-slate-400"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              "حفظ كلمة المرور الجديدة"
            )}
          </button>

        </form>
      </div>
    </div>
  );
}

export default function UpdatePassword() {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <UpdatePasswordContent />
    </Suspense>
  );
}