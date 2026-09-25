export default function LoadingSpinner({ size = 'md', message = 'Loading...' }) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[2.5px]',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3 py-6">
      <div className="relative">
        <div 
          className={`animate-spin rounded-full border-emerald-500/20 border-t-emerald-400 ${sizeClasses[size] || sizeClasses.md}`}
        />
        <div className="absolute inset-0 rounded-full blur-[6px] bg-emerald-500/10 pointer-events-none" />
      </div>
      {message && (
        <p className="text-stone-400 text-xs font-medium uppercase tracking-wider">{message}</p>
      )}
    </div>
  );
}
