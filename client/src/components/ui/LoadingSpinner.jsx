export default function LoadingSpinner({ size = 'md', message = 'Loading...' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div 
        className={`animate-spin rounded-full border-4 border-[#86efac] border-t-transparent ${sizeClasses[size]}`}
      />
      {message && (
        <p className="text-stone-400 text-sm font-medium">{message}</p>
      )}
    </div>
  );
}
