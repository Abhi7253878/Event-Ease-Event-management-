import { Loader2, Inbox, AlertCircle } from 'lucide-react';
export const Spinner = ({ className = '' }) => <div className={`flex justify-center py-16 ${className}`}><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;
export const Empty = ({ title = 'Nothing here yet', text, action }) => (
  <div className="card flex flex-col items-center px-6 py-14 text-center"><Inbox className="mb-3 h-10 w-10 text-slate-300" /><h3 className="font-semibold">{title}</h3>{text && <p className="mt-1 text-sm text-slate-500">{text}</p>}{action && <div className="mt-4">{action}</div>}</div>
);
export const ErrorBox = ({ message, retry }) => (
  <div className="card flex flex-col items-center px-6 py-12 text-center"><AlertCircle className="mb-3 h-10 w-10 text-red-400" /><p className="font-medium text-red-600">{message}</p>{retry && <button className="btn-outline mt-4" onClick={retry}>Retry</button>}</div>
);
export const StatCard = ({ icon: Icon, label, value, tint = 'bg-brand-50 text-brand-600' }) => (
  <div className="card flex items-center gap-4 p-5"><div className={`rounded-xl p-3 ${tint}`}><Icon className="h-6 w-6" /></div><div><p className="text-sm text-slate-500">{label}</p><p className="text-2xl font-bold">{value}</p></div></div>
);
export const Badge = ({ children, color = 'slate' }) => {
  const c = { slate: 'bg-slate-100 text-slate-700', green: 'bg-emerald-100 text-emerald-700', red: 'bg-red-100 text-red-700', indigo: 'bg-indigo-100 text-indigo-700', amber: 'bg-amber-100 text-amber-700' }[color];
  return <span className={`badge ${c}`}>{children}</span>;
};
export const statusColor = s => ({ upcoming: 'indigo', completed: 'green', cancelled: 'red', confirmed: 'green', admin: 'red', organizer: 'amber', attendee: 'indigo' }[s] || 'slate');
export const PageHeader = ({ title, subtitle, action }) => (
  <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">{title}</h1>{subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}</div>{action}</div>
);
export const Table = ({ head, children }) => (
  <div className="card overflow-x-auto"><table className="w-full"><thead className="border-b bg-slate-50"><tr>{head.map(h => <th key={h} className="th">{h}</th>)}</tr></thead><tbody className="divide-y">{children}</tbody></table></div>
);
export function ConfirmButton({ onConfirm, children, className = 'btn-danger', message = 'Are you sure?' }) {
  return <button className={className} onClick={() => window.confirm(message) && onConfirm()}>{children}</button>;
}
