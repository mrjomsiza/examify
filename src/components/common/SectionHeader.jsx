export const SectionHeader = ({ eyebrow, title, description, action }) => (
  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div>
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-700">{eyebrow}</p> : null}
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{title}</h2>
      {description ? <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p> : null}
    </div>
    {action}
  </div>
);
