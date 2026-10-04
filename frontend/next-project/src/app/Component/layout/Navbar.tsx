"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import ShowNotificationsread from "../Section/Shownotificationsunread";
import ShowNotificationsUnread from "../Section/Shownotificationsunread";

function useLocalStorage(key: string) {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener("storage", callback);
      return () => window.removeEventListener("storage", callback);
    },
    () => (typeof window !== "undefined" ? localStorage.getItem(key) : null),
    () => null
  );
}

function Navbar() {
  const pathName = usePathname();
  const router = useRouter();

  const userRole = useLocalStorage("role");
  const token = useLocalStorage("accessToken");
  const isLoggedIn = Boolean(userRole);

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // دالة جلب عدد الإشعارات غير المقروءة
  const fetchUnreadCount = useCallback(() => {
    if (userRole === "beneficiary" && token) {
      fetch(
        "http://localhost:8000/api/notifications/unread-count/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      )
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch unread notifications");
          return res.json();
        })
        .then((data) => {
          // التعامل مع اختلاف شكل الـ Response (سواء كان { count: X } أو رقم مباشر)
          const count = typeof data === "number" ? data : data.count ?? 0;
          setUnreadCount(count);
        })
        .catch((error) => {
          console.error("Notification count error:", error);
          setUnreadCount(0);
        });
    }
  }, [userRole, token]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const getDashboardPath = (role: string | null) => {
    switch (role) {
      case "beneficiary":
        return "/user";
      case "helpdesk":
        return "/helpdesk";
      case "awareness":
        return "/awareness";
      case "registration":
        return "/registration";
      default:
        return "/";
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("accessToken");

    window.dispatchEvent(new Event("storage"));

    setUnreadCount(0);
    setShowNotifications(false);
    setIsMobileMenuOpen(false);
    router.push("/");
  };

  const dashboardPath = getDashboardPath(userRole);

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs transition-all duration-300 rounded-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative overflow-hidden rounded-xl bg-emerald-50/50 p-1.5 transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/Img/Logo11.png"
              alt="Nabad Logo"
              width={52}
              height={52}
              className="h-11 w-auto object-contain"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-slate-900 font-extrabold text-lg sm:text-xl tracking-tight leading-none group-hover:text-emerald-700 transition-colors">
              Nabad <span className="text-emerald-600">Center</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium tracking-wide">
              Nutritional Care
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
          <Link
            href="/"
            className={`text-base font-semibold transition-all duration-200 relative py-1 ${
              pathName === "/" ? "text-emerald-600 font-bold" : "text-slate-600 hover:text-emerald-600"
            }`}
          >
            Home
            {pathName === "/" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-full" />
            )}
          </Link>

          <Link
            href="/health"
            className={`text-base font-semibold transition-all duration-200 relative py-1 ${
              pathName === "/health" ? "text-emerald-600 font-bold" : "text-slate-600 hover:text-emerald-600"
            }`}
          >
            Health
            {pathName === "/health" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-full" />
            )}
          </Link>

          {isLoggedIn && (
            <Link
              href={dashboardPath}
              className={`text-base font-semibold transition-all duration-200 relative py-1 ${
                pathName === dashboardPath ? "text-emerald-600 font-bold" : "text-slate-600 hover:text-emerald-600"
              }`}
            >
              My Profile
              {pathName === dashboardPath && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-full" />
              )}
            </Link>
          )}
        </nav>

        {/* Action Controls & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isLoggedIn ? (
            <>
              {userRole === "beneficiary" && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications((prev) => !prev)}
                    className="relative p-2.5 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200 cursor-pointer"
                    aria-label="Notifications"
                  >
                    <span className="text-xl">🔔</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <ShowNotificationsUnread
                      onClose={() => {
                        setShowNotifications(false);
                        fetchUnreadCount(); // إعادة جلب العداد للتأكيد
                      }}
                      onUnreadChange={(count) => setUnreadCount(count)}
                    />
                  )}
                </div>
              )}

              <button
                onClick={handleSignOut}
                className="hidden sm:block px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 active:scale-95 text-white font-semibold text-sm shadow-md transition-all duration-200 cursor-pointer"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" className="hidden sm:block">
              <button className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 transition-all duration-200 cursor-pointer">
                Sign In
              </button>
            </Link>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition duration-200 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <span className="text-2xl font-bold">✕</span>
            ) : (
              <span className="text-2xl">☰</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-3 rounded-b-xl shadow-lg transition-all animate-fadeIn">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block px-4 py-2.5 rounded-xl text-base font-semibold transition-colors ${
              pathName === "/"
                ? "bg-emerald-50 text-emerald-600"
                : "text-slate-700 hover:bg-slate-50 hover:text-emerald-600"
            }`}
          >
            Home
          </Link>

          <Link
            href="/health"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block px-4 py-2.5 rounded-xl text-base font-semibold transition-colors ${
              pathName === "/health"
                ? "bg-emerald-50 text-emerald-600"
                : "text-slate-700 hover:bg-slate-50 hover:text-emerald-600"
            }`}
          >
            Health
          </Link>

          {isLoggedIn && (
            <Link
              href={dashboardPath}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                pathName === dashboardPath
                  ? "bg-emerald-50 text-emerald-600"
                  : "text-slate-700 hover:bg-slate-50 hover:text-emerald-600"
              }`}
            >
              My Profile
            </Link>
          )}

          <div className="pt-2 border-t border-slate-100 sm:hidden">
            {isLoggedIn ? (
              <button
                onClick={handleSignOut}
                className="w-full text-center px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 active:scale-95 text-white font-semibold text-sm shadow-md transition-all duration-200 cursor-pointer"
              >
                Sign Out
              </button>
            ) : (
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all duration-200 cursor-pointer">
                  Sign In
                </button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;