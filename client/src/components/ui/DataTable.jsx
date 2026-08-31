import { useState, useMemo } from 'react';
import { Search, Inbox } from 'lucide-react';
import EmptyState from './EmptyState';

export default function DataTable({ 
  columns = [], 
  data = [], 
  loading = false, 
  emptyMessage = 'No data available',
  searchable = false,
  searchPlaceholder = 'Search...'
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchable || !searchTerm.trim()) return data;
    
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter(row => {
      return Object.values(row).some(value => 
        value != null && String(value).toLowerCase().includes(lowerSearch)
      );
    });
  }, [data, searchTerm, searchable]);

  return (
    <div className="w-full flex flex-col space-y-4">
      {searchable && (
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-stone-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-white/[0.08] rounded-xl bg-slate-950/50 text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[#86efac]/50 focus:ring-1 focus:ring-[#86efac]/50 transition-colors"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-300">
            <thead className="text-xs text-stone-400 bg-black/40 border-b border-white/[0.06]">
              <tr>
                {columns.map((col, i) => (
                  <th key={col.key || i} className="px-6 py-4 font-medium uppercase tracking-wider">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((col, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-white/5 rounded skeleton w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12">
                    <EmptyState 
                      icon={Inbox}
                      title="No Results Found"
                      description={searchTerm ? "Try adjusting your search query." : emptyMessage}
                    />
                  </td>
                </tr>
              ) : (
                filteredData.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    {columns.map((col, j) => (
                      <td key={col.key || j} className="px-6 py-4 whitespace-nowrap">
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Card View */}
        <div className="md:hidden flex flex-col divide-y divide-white/[0.04]">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 space-y-3">
                {columns.slice(0, 3).map((_, j) => (
                  <div key={j} className="h-4 bg-white/5 rounded skeleton w-2/3"></div>
                ))}
              </div>
            ))
          ) : filteredData.length === 0 ? (
            <div className="p-8">
              <EmptyState 
                icon={Inbox}
                title="No Results Found"
                description={searchTerm ? "Try adjusting your search query." : emptyMessage}
              />
            </div>
          ) : (
            filteredData.map((row, i) => (
              <div key={i} className="p-4 space-y-2">
                {columns.map((col, j) => (
                  <div key={col.key || j} className="flex flex-col">
                    <span className="text-xs text-stone-500 uppercase font-medium">{col.label}</span>
                    <span className="text-sm text-stone-200">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
