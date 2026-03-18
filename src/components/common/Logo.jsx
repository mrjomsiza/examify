export const Logo = ({ className = '' }) => (
  <div className={`inline-flex items-center gap-3 ${className}`}>
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold text-white shadow-lg shadow-brand-600/30">
      Ex
    </div>
    <div>
      <p className="text-lg font-bold tracking-tight text-slate-950">Examify</p>
      <p className="text-xs text-slate-500">Maths mastery • 70-20-10 learning</p>
    </div>
  </div>
);
