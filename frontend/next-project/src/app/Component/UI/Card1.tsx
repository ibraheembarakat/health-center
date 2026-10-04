export interface Card1Props {
  head: string;
  text: string;
  img?: string;
}

function Card1({ props }: { props: Card1Props }) {
  return (
    <div className="group relative bg-white/90 backdrop-blur-md rounded-2xl p-7 sm:p-8 border border-emerald-100/80 shadow-md hover:shadow-2xl shadow-emerald-900/5 hover:border-emerald-300 transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between w-80 sm:w-96 min-h-[260px] overflow-hidden text-left">
      
      {/* خط توهج متدرج يظهر في الأعلى عند مرور الماوس */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-emerald-500 via-teal-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />

      {/* خلفية ضبابية تظهر خلف الأيقونة عند الهوفر */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>

      <div className="flex flex-col gap-4 relative z-10">
        {/* شارة أيقونة تفاعلية تتبدل ألوانها عند مرور الماوس */}
        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xl group-hover:bg-emerald-600 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
          ✦
        </div>

        <h3 className="text-xl font-bold text-slate-800 group-hover:text-emerald-600 transition-colors duration-200 leading-snug">
          {props.head}
        </h3>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
          {props.text}
        </p>
      </div>

      {/* رابط/سهم أسفل الكرت يتفاعل بالحركة */}
      <div className="pt-6 mt-2 flex items-center gap-2 text-emerald-600 font-semibold text-sm opacity-80 group-hover:opacity-100 transition-all duration-200 relative z-10">
        <span>Learn more</span>
        <span className="transform group-hover:translate-x-1.5 transition-transform duration-200">→</span>
      </div>

    </div>
  );
}

export default Card1;