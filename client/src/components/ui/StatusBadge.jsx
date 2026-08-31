export default function StatusBadge({ status, size = 'md' }) {
  const normalizedStatus = (status || '').toLowerCase();
  
  let colorClasses = 'bg-stone-500/10 text-stone-400 border-stone-500/20'; // default

  if (['pending', 'upcoming', 'draft'].includes(normalizedStatus)) {
    colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  } else if (['accepted', 'published', 'open', 'present', 'registration_open'].includes(normalizedStatus)) {
    colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  } else if (['rejected', 'closed', 'absent', 'registration_closed'].includes(normalizedStatus)) {
    colorClasses = 'bg-red-500/10 text-red-400 border-red-500/20';
  } else if (['completed', 'ongoing'].includes(normalizedStatus)) {
    colorClasses = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center justify-center rounded-full font-medium border capitalize ${colorClasses} ${sizeClasses}`}>
      {status ? status.replace('_', ' ') : 'Unknown'}
    </span>
  );
}
