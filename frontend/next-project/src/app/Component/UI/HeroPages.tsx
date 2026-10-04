import Image from "next/image";
import CapitalLatter from "./CapitalLatter";
import { HeroPage } from "@/app/interface";

type Props = HeroPage;

function HeroPages({
  name,
  role,
  address,
  date_of_birth,
  registration_date,
  nutrition_status,
  weight,
  height,
  phone,
  email,
}: Props) {
  return (
    <div className="w-full px-4 sm:px-8 py-6">
      <div className="max-w-7xl mx-auto relative overflow-hidden rounded-3xl bg-linear-to-r from-teal-950 via-slate-900 to-emerald-950 p-8 sm:p-12 lg:p-14 shadow-2xl text-white border border-teal-800/40">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
          <div className="flex-1 space-y-6 text-left">
            <div className="space-y-3">
              {role && (
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-300 font-extrabold text-xs tracking-widest uppercase backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {role === "registration"
                    ? "Registration Officer"
                    : role === "beneficiary"
                      ? "Beneficiary"
                      : "Awareness Officer"}
                </span>
              )}
              {name && (
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                  <CapitalLatter text={name} />
                </h1>
              )}
            </div>
            <div className="w-24 h-1 bg-linear-to-r from-emerald-400 to-teal-500 rounded-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-base sm:text-lg text-emerald-100/90 pt-2 font-medium">
              {address && (
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0 backdrop-blur-md border border-white/10">
                    📍
                  </span>
                  <div className="flex gap-2 items-center justify-center">
                    <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold">Address :</div>
                    <div className="text-white font-semibold">{address}</div>
                  </div>
                </div>
              )}
              {date_of_birth && (
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0 backdrop-blur-md border border-white/10">
                    🎂
                  </span>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold">Date of Birth</div>
                    <div className="text-white font-semibold">{date_of_birth}</div>
                  </div>
                </div>
              )}
              {registration_date && (
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0 backdrop-blur-md border border-white/10">
                    📅
                  </span>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold">Registered Date</div>
                    <div className="text-white font-semibold">{registration_date}</div>
                  </div>
                </div>
              )}
              {nutrition_status && (
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0 backdrop-blur-md border border-white/10">
                    🥗
                  </span>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold">Nutrition Status</div>
                    <div className="text-white font-semibold">{nutrition_status}</div>
                  </div>
                </div>
              )}
              {weight && height && (
                <div className="flex items-center gap-3 sm:col-span-2">
                  <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0 backdrop-blur-md border border-white/10">
                    ⚖️
                  </span>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold">Body Metrics</div>
                    <div className="text-white font-semibold">
                      Weight: {weight} kg | Height: {height} m
                    </div>
                  </div>
                </div>
              )}
            </div>
            {(phone || email) && (
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/10">
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    <span>📞</span>
                    <span>{phone}</span>
                  </a>
                )}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/15 backdrop-blur-md active:scale-95"
                  >
                    <span>📧</span>
                    <span>{email}</span>
                  </a>
                )}
              </div>
            )}
          </div>
          <div className="relative w-full md:w-80 lg:w-100 aspect-4/3 md:aspect-square rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl shrink-0 group">
            <Image
              src={
                role === "registration"
                  ? "/Img/register.jpg"
                  : role === "beneficiary"
                    ? "/Img/heroBen.jpg"
                    : "/Img/awar.png"
              }
              alt="Hero"
              fill
              priority
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroPages;