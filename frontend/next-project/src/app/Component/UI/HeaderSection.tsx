export interface HeaderSectionProps {
  head: string;
  text: string;
  badge?: string; // أضفنا هاد المتغير اختياري لتحديد اسم القسم (مثل: SERVICES أو ABOUT US)
}

function HeaderSection({ head, text, badge }: HeaderSectionProps) {
  return (
    <div className="w-full max-w-3xl text-center flex flex-col items-center gap-3">
      {/* شارة علوية تظهر فقط إذا أرسلتِ badge */}
      {badge && (
        <span className="text-emerald-700 text-xs sm:text-sm font-extrabold tracking-widest uppercase bg-emerald-100/80 px-4 py-1.5 rounded-full border border-emerald-200">
          {badge}
        </span>
      )}

      {/* العنوان الرئيسي */}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight pt-1">
        {head}
      </h2>

      {/* خط زمردي ناعم تحت العنوان */}
      <div className="w-16 h-1 bg-emerald-500 rounded-full my-1"></div>

      {/* النص التوضيحي */}
      <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl">
        {text}
      </p>
    </div>
  );
}

export default HeaderSection;