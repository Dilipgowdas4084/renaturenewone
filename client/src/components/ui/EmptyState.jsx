export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white/[0.02] border border-white/[0.06] rounded-2xl">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-emerald-950/30 border border-emerald-900/30 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-[#86efac]" />
        </div>
      )}
      {title && <h3 className="text-lg font-semibold text-stone-300 mb-2">{title}</h3>}
      {description && <p className="text-sm text-stone-500 max-w-md mx-auto mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
