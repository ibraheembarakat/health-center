"use client";
import { useEffect, useState } from "react";

function ScrollButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {show && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-emerald-600 text-white shadow-xl hover:bg-emerald-700 hover:scale-110 active:scale-95 transition-all duration-300 border border-emerald-500/20 group"
        >
          {/* سهم أنيق ينزلق للأعلى خفيفاً عند الـ Hover */}
          <span className="text-xl font-bold transition-transform duration-300 group-hover:-translate-y-0.5">
            ↑
          </span>
        </button>
      )}
    </>
  );
}

export default ScrollButton;