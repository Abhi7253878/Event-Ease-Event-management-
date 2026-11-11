import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Sparkles, CalendarCheck, Ticket, Search as S2, Music, Cpu, Briefcase, Trophy, Palette, GraduationCap, Utensils, Layers } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import EventCard from '../components/EventCard';
import { Spinner, Empty } from '../components/UI';
const icons = { Technology: Cpu, Music, Business: Briefcase, Sports: Trophy, 'Art & Culture': Palette, Education: GraduationCap, 'Food & Drink': Utensils };
export default function Home() {
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const featured = useFetch('/events?featured=true&limit=3');
  const upcoming = useFetch('/events?limit=6&sort=date');
  const cats = useFetch('/admin/categories');
  const go = e => { e.preventDefault(); nav(`/events?search=${encodeURIComponent(q)}`); };
  return (<>
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white">
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 py-24 text-center md:py-32">
        <span className="fade-up inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur"><Sparkles className="h-4 w-4" />Discover events that move you</span>
        <h1 className="fade-up mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">Find, book and host unforgettable events</h1>
        <p className="fade-up mx-auto mt-5 max-w-xl text-lg text-indigo-100">From tech meetups to music nights — register in seconds, or create and manage your own events.</p>
        <form onSubmit={go} className="fade-up mx-auto mt-10 flex max-w-2xl items-center gap-2 rounded-2xl bg-white p-2 shadow-2xl">
          <Search className="ml-3 h-5 w-5 text-slate-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search events, cities or topics…" className="flex-1 px-2 py-3 text-slate-800 outline-none" />
          <button className="btn-primary px-6 py-3">Search</button>
        </form>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 pt-16">
      <div className="mb-6 flex items-end justify-between"><div><h2 className="text-2xl font-bold">Featured events</h2><p className="text-slate-500">Hand-picked experiences</p></div></div>
      {featured.loading ? <Spinner /> : featured.data?.events.length ? <div className="grid gap-6 md:grid-cols-3">{featured.data.events.map(e => <EventCard key={e._id} event={e} />)}</div> : <Empty title="No featured events yet" />}
    </section>

    <section className="mx-auto max-w-7xl px-4 pt-16">
      <div className="mb-6 flex items-end justify-between"><div><h2 className="text-2xl font-bold">Upcoming events</h2><p className="text-slate-500">Don't miss what's next</p></div><Link to="/events" className="flex items-center gap-1 font-semibold text-brand-600">View all<ArrowRight className="h-4 w-4" /></Link></div>
      {upcoming.loading ? <Spinner /> : upcoming.data?.events.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{upcoming.data.events.map(e => <EventCard key={e._id} event={e} />)}</div> : <Empty title="No upcoming events" />}
    </section>

    <section className="mx-auto max-w-7xl px-4 pt-16">
      <h2 className="mb-6 text-2xl font-bold">Browse by category</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cats.data?.categories.map(c => { const I = icons[c.name] || Layers; return (
          <Link key={c._id} to={`/events?category=${c._id}`} className="card flex items-center gap-3 p-5 transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md"><span className="rounded-xl bg-brand-50 p-3 text-brand-600"><I className="h-6 w-6" /></span><span className="font-semibold">{c.name}</span></Link>); })}
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 pt-20">
      <h2 className="mb-10 text-center text-2xl font-bold">How it works</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {[[S2, 'Discover', 'Search and filter events by category, date and price.'], [Ticket, 'Register', 'Book your seat instantly and get a unique booking reference.'], [CalendarCheck, 'Attend', 'Manage bookings, get notifications and enjoy the event.']].map(([I, t, d], i) => (
          <div key={t} className="card p-8 text-center"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white"><I className="h-7 w-7" /></div><p className="text-xs font-bold text-brand-600">STEP {i + 1}</p><h3 className="mt-1 text-lg font-bold">{t}</h3><p className="mt-2 text-sm text-slate-500">{d}</p></div>))}
      </div>
    </section>

    <section className="mx-auto mt-20 max-w-7xl px-4">
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-14 text-center text-white">
        <h2 className="text-3xl font-extrabold">Ready to host your own event?</h2>
        <p className="mx-auto mt-3 max-w-xl text-indigo-100">Create an organizer account to publish events, track registrations and view analytics.</p>
        <Link to="/register" className="btn mt-7 bg-white px-7 py-3 text-brand-700 hover:bg-indigo-50">Get started free</Link>
      </div>
    </section>
  </>);
}
