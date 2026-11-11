export const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
export const fmtDateTime = d => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
export const fmtPrice = p => (p > 0 ? `₹${p}` : 'Free');
export const gradients = ['from-indigo-500 to-violet-600', 'from-fuchsia-500 to-indigo-600', 'from-sky-500 to-indigo-600', 'from-violet-500 to-pink-500', 'from-emerald-500 to-sky-600'];
export const gradientFor = id => gradients[(id || '').charCodeAt((id || '').length - 1) % gradients.length];
export const toInputDate = d => new Date(d).toISOString().slice(0, 10);
