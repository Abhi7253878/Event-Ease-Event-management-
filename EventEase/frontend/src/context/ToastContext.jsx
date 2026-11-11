import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
const Ctx = createContext();
export const useToast = () => useContext(Ctx);
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((message, type = 'success') => {
    const id = Math.random();
    setItems(s => [...s, { id, message, type }]);
    setTimeout(() => setItems(s => s.filter(i => i.id !== id)), 3500);
  }, []);
  const toast = { success: m => push(m, 'success'), error: m => push(m, 'error') };
  return (
    <Ctx.Provider value={toast}>
      {children}
      <div className="fixed right-4 top-4 z-[100] space-y-2">
        {items.map(i => (
          <div key={i.id} className="fade-up flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-medium shadow-lg">
            {i.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-red-500" />}{i.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
