"use client";

import { useEffect, useState } from "react";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  notification_type?: string;
  sender_name?: string;
  type_display?: string;
}

interface ReadNotificationsResponse {
  results: NotificationItem[];
}

interface ShowNotificationsProps {
  onClose: () => void;
  onUnreadChange?: (count: number) => void;
}

export default function ShowNotificationsUnread({
  onClose,
  onUnreadChange,
}: ShowNotificationsProps) {
  const [unreadNotifications, setUnreadNotifications] = useState<
    NotificationItem[]
  >([]);

  const [readNotifications, setReadNotifications] = useState<
    NotificationItem[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState<number | null>(null);

  const API_URL = "http://localhost:8000";

  const getToken = () => {
    return localStorage.getItem("accessToken");
  };

  // =========================
  // جلب الإشعارات
  // =========================
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("لا يوجد Access Token");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning" : "true"
      };

      // نستدعي الاثنين بنفس الوقت
      const [unreadResponse, allResponse] = await Promise.all([
        fetch(`${API_URL}/api/notifications/unread/`, {
          method: "GET",
          headers,
        }),

        fetch(`${API_URL}/api/notifications/`, {
          method: "GET",
          headers,
        }),
      ]);

      console.log("UNREAD STATUS:", unreadResponse.status);
      console.log("ALL STATUS:", allResponse.status);

      const unreadData = await unreadResponse.json();
      const allData: ReadNotificationsResponse = await allResponse.json();

      console.log("UNREAD API RESPONSE:", unreadData);
      console.log("ALL NOTIFICATIONS API RESPONSE:", allData);

      if (!unreadResponse.ok) {
        throw new Error("فشل جلب الإشعارات غير المقروءة");
      }

      if (!allResponse.ok) {
        throw new Error("فشل جلب جميع الإشعارات");
      }

      // unread API يرجع Array مباشرة
      const unread = unreadData || [];

      // all API يرجع { results: [] }
      const read = (allData.results || []).filter(
        (notification) => notification.is_read === true
      );

      setUnreadNotifications(unread);
      setReadNotifications(read);

      // تحديث عداد الجرس
      onUnreadChange?.(unread.length);
    } catch (err) {
      console.error("NOTIFICATIONS ERROR:", err);
      setError("حدث خطأ أثناء جلب الإشعارات");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // تحويل الإشعار إلى مقروء
  // =========================
  const markAsRead = async (notification: NotificationItem) => {
    try {
      setMarkingId(notification.id);

      const token = getToken();

      if (!token) {
        setError("لا يوجد Access Token");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/notifications/${notification.id}/mark-read/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning" : "true"
          },
        }
      );

      console.log(
        `MARK READ STATUS (${notification.id}):`,
        response.status
      );

      const data = await response.json();

      console.log(
        `MARK READ API RESPONSE (${notification.id}):`,
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.detail || "فشل تحويل الإشعار إلى مقروء"
        );
      }

      // الإشعار أصبح مقروء
      const updatedNotification = {
        ...notification,
        is_read: true,
      };

      // حذفه من غير المقروء
      setUnreadNotifications((prev) =>
        prev.filter((item) => item.id !== notification.id)
      );

      // إضافته في بداية المقروءة
      setReadNotifications((prev) => [
        updatedNotification,
        ...prev.filter((item) => item.id !== notification.id),
      ]);

      // إنقاص عداد الجرس
      onUnreadChange?.(Math.max(unreadNotifications.length - 1, 0));
    } catch (err) {
      console.error("MARK READ ERROR:", err);
      setError("حدث خطأ أثناء تحويل الإشعار إلى مقروء");
    } finally {
      setMarkingId(null);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleString("ar", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return date;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-24">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              الإشعارات
            </h2>

            {unreadNotifications.length > 0 && (
              <p className="mt-1 text-xs text-emerald-600">
                لديك {unreadNotifications.length} إشعار غير مقروء
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-slate-500 transition hover:bg-slate-100 hover:text-red-500"
          >
            ×
          </button>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="max-h-[70vh] overflow-y-auto p-5">

          {loading ? (
            <div className="py-12 text-center text-slate-500">
              جاري تحميل الإشعارات...
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* =====================================
                  غير المقروءة
              ===================================== */}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-800">
                    غير المقروءة
                  </h3>

                  <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600">
                    {unreadNotifications.length}
                  </span>
                </div>

                {unreadNotifications.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                    <p className="text-sm text-slate-400">
                      لا يوجد إشعارات غير مقروءة
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {unreadNotifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => markAsRead(notification)}
                        disabled={markingId === notification.id}
                        className="w-full rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-right transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <div className="flex items-start gap-3">

                          {/* نقطة غير مقروء */}
                          <span className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full bg-red-500" />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <h4 className="font-bold text-slate-800">
                                {notification.title}
                              </h4>

                              <span className="whitespace-nowrap text-[11px] text-slate-400">
                                {formatDate(notification.created_at)}
                              </span>
                            </div>

                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {notification.message}
                            </p>

                            {notification.sender_name && (
                              <p className="mt-2 text-xs text-slate-500">
                                من: {notification.sender_name}
                              </p>
                            )}

                            {markingId === notification.id && (
                              <p className="mt-2 text-xs font-medium text-emerald-600">
                                جاري تحويله إلى مقروء...
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* الخط الفاصل */}
              <div className="my-6 border-t border-slate-200" />

              {/* =====================================
                  المقروءة
              ===================================== */}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-800">
                    المقروءة
                  </h3>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                    {readNotifications.length}
                  </span>
                </div>

                {readNotifications.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                    <p className="text-sm text-slate-400">
                      لا يوجد إشعارات مقروءة
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {readNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-start gap-3">

                          {/* نقطة مقروء */}
                          <span className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full bg-slate-300" />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <h4 className="font-bold text-slate-700">
                                {notification.title}
                              </h4>

                              <span className="whitespace-nowrap text-[11px] text-slate-400">
                                {formatDate(notification.created_at)}
                              </span>
                            </div>

                            <p className="mt-1 text-sm leading-6 text-slate-500">
                              {notification.message}
                            </p>

                            {notification.sender_name && (
                              <p className="mt-2 text-xs text-slate-400">
                                {notification.sender_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}