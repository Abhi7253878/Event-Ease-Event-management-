import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import EventCard from '../components/EventCard';
import { Spinner, Empty, ErrorBox } from '../components/UI';
export default function Explore() {
  const [sp, setSp] = useSearchParams();
  const [search, setSearch] = useState(sp.get('search') || '');
  const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); if (k !== 'page') n.delete('page'); setSp(n); };
  useEffect(() => { const t = setTimeout(() => search !== (sp.get('search') || '') && set('search', search), 400); return () => clearTimeout(t); }, [search]); // eslint-disable-line
  const qs = new URLSearchParams({ limit: 9, ...Object.fromEntries(sp) }).toString();
  const { data, loading, error, reload } = useFetch(`/events?${qs}`);
  const cats = useFetch('/admin/categories');
  const page = +(sp.get('page') || 1);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Explore events</h1><p className="text-slate-500">Find something worth showing up for.</p>
      <div className="card mt-6 grid gap-3 p-4 md:grid-cols-6">
        <div className="relative md:col-span-2"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input className="input pl-9" placeholder="Search title, location…" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select className="input" value={sp.get('category') || ''} onChange={e => set('category', e.target.value)}><option value="">All categories</option>{cats.data?.categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
        <input type="date" className="input" value={sp.get('from') || ''} onChange={e => set('from', e.target.value)} title="From date" />
        <select className="input" value={sp.get('free') || ''} onChange={e => set('free', e.target.value)}><option value="">Any price</option><option value="true">Free</option><option value="false">Paid</option></select>
        <select className="input" value={sp.get('sort') || 'date'} onChange={e => set('sort', e.target.value)}><option value="date">Soonest</option><option value="newest">Newest</option><option value="popular">Popular</option><option value="price">Price</option></select>
      </div>
      <div className="mt-2 flex items-center justify-between text-sm text-slate-500"><span className="flex items-center gap-1"><SlidersHorizontal className="h-4 w-4" />{data ? `${data.total} events found` : ''}</span>{[...sp.keys()].length > 0 && <button className="font-medium text-brand-600" onClick={() => { setSearch(''); setSp({}); }}>Clear filters</button>}</div>
      <div className="mt-6">
        {loading ? <Spinner /> : error ? <ErrorBox message={error} retry={reload} /> : data.events.length === 0 ? <Empty title="No events match" text="Try changing or clearing your filters." /> :
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.events.map(e => <EventCard key={e._id} event={e} />)}</div>}
      </div>
      {data?.pages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <button className="btn-outline" disabled={page <= 1} onClick={() => set('page', page - 1)}>Previous</button>
          <span className="text-sm text-slate-600">Page {data.page} of {data.pages}</span>
          <button className="btn-outline" disabled={page >= data.pages} onClick={() => set('page', page + 1)}>Next</button>
        </div>)}
    </div>
  );
}
