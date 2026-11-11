import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';
import { assetUrl } from '../services/api';
import { fmtDate, fmtPrice, gradientFor } from '../utils/format';
export default function EventCard({ event: e }) {
  const left = e.capacity - e.registrationCount;
  return (
    <Link to={`/events/${e._id}`} className="card fade-up group overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-44 overflow-hidden">
        {e.bannerImage ? <img src={assetUrl(e.bannerImage)} alt={e.title} className="h-full w-full object-cover transition group-hover:scale-105" />
          : <div className={`flex h-full items-end bg-gradient-to-br ${gradientFor(e._id)} p-4`}><span className="text-4xl font-extrabold text-white/30">{e.category?.name}</span></div>}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-brand-700">{e.category?.name}</span>
        <span className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white">{fmtPrice(e.ticketPrice)}</span>
      </div>
      <div className="space-y-2 p-5">
        <h3 className="line-clamp-1 text-lg font-bold group-hover:text-brand-600">{e.title}</h3>
        <p className="flex items-center gap-2 text-sm text-slate-500"><Calendar className="h-4 w-4" />{fmtDate(e.date)} · {e.startTime}</p>
        <p className="flex items-center gap-2 text-sm text-slate-500"><MapPin className="h-4 w-4" /><span className="line-clamp-1">{e.location}</span></p>
        <p className={`flex items-center gap-2 text-sm font-medium ${left <= 0 ? 'text-red-600' : 'text-emerald-600'}`}><Users className="h-4 w-4" />{left <= 0 ? 'Sold out' : `${left} seats left`}</p>
      </div>
    </Link>
  );
}
