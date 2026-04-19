const colorMap = {
  purple: 'from-violet-500 to-fuchsia-500 text-white shadow-violet-500/25',
  blue: 'from-blue-500 to-cyan-500 text-white shadow-blue-500/25',
  green: 'from-emerald-400 to-teal-500 text-white shadow-emerald-500/25',
  yellow: 'from-amber-400 to-orange-500 text-white shadow-orange-500/25',
  slate: 'from-slate-600 to-slate-800 text-white shadow-slate-500/25',
  white: 'bg-white border hover:border-blue-200 border-slate-200 text-slate-800 shadow-sm',
};

export default function MetricCard({ title, value, note, color = 'white', icon }) {
  const isWhite = color === 'white';
  const gradientClass = colorMap[color] || colorMap.white;

  return (
    <div
      className={`group relative overflow-hidden rounded-[1.5rem] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        !isWhite ? 'bg-gradient-to-br' : ''
      } ${gradientClass}`}
    >
      {/* Decorative Blur behind the card for solid gradient blocks */}
      {!isWhite && (
        <div className="absolute top-0 right-0 -m-4 h-24 w-24 rounded-full bg-white/10 blur-xl transition-transform duration-500 group-hover:scale-150" />
      )}
      
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex flex-col">
          <p className={`text-sm font-semibold tracking-wide uppercase ${isWhite ? 'text-slate-500' : 'text-white/80'}`}>
            {title}
          </p>
          <p className={`mt-3 text-4xl font-bold tracking-tight ${isWhite ? 'text-slate-900 group-hover:text-blue-600 transition-colors' : 'text-white'}`}>
            {value}
          </p>
        </div>
        
        {/* Render optional icon SVG or generic dot if wanted */}
        {icon || (
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl backdrop-blur-sm ${isWhite ? 'bg-blue-50' : 'bg-black/10 shadow-inner'}`}>
             <span className={isWhite ? 'text-blue-500' : 'text-white/90'}>
               <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
             </span>
          </div>
        )}
      </div>

      {note && (
        <div className="relative z-10 mt-4 flex items-center gap-2">
          <span className={`flex h-1.5 w-1.5 rounded-full ${isWhite ? 'bg-blue-500' : 'bg-white/50'}`} />
          <p className={`text-xs font-medium ${isWhite ? 'text-slate-500' : 'text-white/80'}`}>
            {note}
          </p>
        </div>
      )}
    </div>
  );
}
