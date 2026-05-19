export default function PageHeader({ title, description, icon: Icon }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        {Icon && <Icon className="w-6 h-6 text-emerald-500" />}
        <h1 className="text-2xl font-bold font-mono text-slate-100">{title}</h1>
      </div>
      {description && (
        <p className="text-slate-400 text-sm font-mono">{description}</p>
      )}
    </div>
  )
}