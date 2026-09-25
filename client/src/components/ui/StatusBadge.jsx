export default function StatusBadge({ status, size = 'md' }) {
  const normalizedStatus = (status || '').toLowerCase();
  
  let colorClasses = 'bg-stone-500/10 text-stone-300 border-stone-500/20'; // default
  let dotColor = 'bg-stone-400';

  if (['pending', 'upcoming', 'draft'].includes(normalizedStatus)) {
    colorClasses = 'bg-amber-500/10 text-amber-300 border-amber-500/25';
    dotColor = 'bg-amber-400';
  } else if (['accepted', 'published', 'open', 'present', 'registration_open'].includes(normalizedStatus)) {
    colorClasses = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25';
    dotColor = 'bg-emerald-400';
  } else if (['rejected', 'closed', 'absent', 'registration_closed'].includes(normalizedStatus)) {
    colorClasses = 'bg-rose-500/10 text-rose-300 border-rose-500/25';
    dotColor = 'bg-rose-400';
  } else if (['completed', 'ongoing'].includes(normalizedStatus)) {
    colorClasses = 'bg-sky-500/10 text-sky-300 border-sky-500/25';
    dotColor = 'bg-sky-400';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px] gap-1.5' : 'px-2.5 py-1 text-xs gap-2';

  return (
    <span className={`inline-flex items-center justify-center rounded-full font-semibold border capitalize tracking-wide ${colorClasses} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {status ? status.replace('_', ' ') : 'Unknown'}
    </span>
  );
}
