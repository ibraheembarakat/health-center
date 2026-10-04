"use client";

import { useState } from "react";
import Link from "next/link";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8000/api/auth/password-reset/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ email }),
        }
      );

      // التحقق مما إذا كانت الاستجابة بصيغة JSON قبل فك الشفرة
      const contentType = response.headers.get("content-type");
      let data: any = {};

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else if (!response.ok) {
        throw new Error("Server response error. Please try again later.");
      }

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.email?.[0] ||
            data.message ||
            "Unable to process request. Please check your email."
        );
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Password reset error:", error);

      // صياغة رسالة الخطأ لتكون واضحة وصديقة للمستخدم
      if (
        error instanceof SyntaxError ||
        (error instanceof Error && error.message.includes("JSON"))
      ) {
        setErrorMessage("Server error or connection issue. Please try again in a few moments.");
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
            📧
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Forgot your password?
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Enter your email address below and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Success View */}
        {isSubmitted ? (
          <div className="space-y-5 animate-fadeIn">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <span className="text-3xl block">📩</span>
              <h3 className="font-bold text-emerald-800 text-sm">Reset Link Sent</h3>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Instructions have been sent to <span className="font-semibold underline">{email}</span>. Please check your inbox (and spam folder).
              </p>
            </div>

            <Link
              href="/login"
              className="w-full block text-center py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium flex items-center gap-2">
                <span>⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Email Address *
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-500 hover:text-emerald-600 transition"
              >
                Remembered your password? <span className="text-emerald-600 underline">Sign In</span>
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

export default ForgotPassword;