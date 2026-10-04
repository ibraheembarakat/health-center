"use client";
import Link from "next/link";

export default function TopBar() {
  return (
    <div className="w-full bg-slate-900 text-white py-3 px-4 text-xs sm:text-sm font-medium shadow-sm rounded-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        <div className="flex items-center gap-3 mx-auto sm:mx-0">
          <span className="relative flex h-3.5 w-3.5 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-emerald-300/40"></span>
          </span>
          
          <Link href="/" className="text-slate-200">
            Welcome to <span className="text-white font-bold">Nabad Center</span> for Health Support
          </Link>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/#service"
            className="group inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-xs font-semibold transition-colors px-3 py-1 rounded-lg bg-emerald-950/50 border border-emerald-500/20"
          >
            <span>Explore Services</span>
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

      </div>
    </div>
  );
}