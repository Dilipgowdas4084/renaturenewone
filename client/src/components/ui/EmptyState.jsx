// Icon can be a component (lucide icons are forwardRef objects, not plain functions) or a rendered element.
import { isValidElement } from 'react';
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[#071712]/60 border border-white/[0.08] rounded-2xl backdrop-blur-xl">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
          {isValidElement(Icon) ? Icon : <Icon className="w-7 h-7" />}
        </div>
      )}
      {title && <h3 className="text-base font-bold text-white mb-1.5">{title}</h3>}
      {description && <p className="text-sm text-stone-400 max-w-sm mx-auto mb-6 leading-relaxed">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
