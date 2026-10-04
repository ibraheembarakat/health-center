export interface CardNumberProps {
    number: string;
    text: string;
    icon: string;
}

function CardNumber({ number, text, icon }: CardNumberProps) {
    return (
        <div className="group relative bg-white/90 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-emerald-100 shadow-md hover:shadow-xl shadow-emerald-900/5 hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center gap-3 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 shadow-inner">
                {icon}
            </div>

            <span className="text-3xl sm:text-4xl font-black bg-linear-to-r from-emerald-700 via-teal-600 to-emerald-800 bg-clip-text text-transparent">
                {number}
            </span>
            
            <span className="text-sm sm:text-base font-semibold text-slate-600 leading-snug">
                {text}
            </span>
        </div>
    );
}

export default CardNumber;