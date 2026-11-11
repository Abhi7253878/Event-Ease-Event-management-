import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
export default function Footer() {
  return (
    <footer className="mt-20 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2"><div className="flex items-center gap-2 text-xl font-extrabold text-white"><CalendarDays className="text-brand-500" />EventEase</div><p className="mt-3 max-w-sm text-sm text-slate-400">Discover, book and manage events with a platform built for attendees, organizers and admins.</p></div>
        <div><h4 className="mb-3 font-semibold text-white">Platform</h4><ul className="space-y-2 text-sm"><li><Link to="/events">Explore events</Link></li><li><Link to="/register">Become an organizer</Link></li><li><Link to="/about">About us</Link></li></ul></div>
        <div><h4 className="mb-3 font-semibold text-white">Support</h4><ul className="space-y-2 text-sm"><li><Link to="/contact">Contact us</Link></li><li><Link to="/login">Log in</Link></li></ul></div>
      </div>
      <div className="border-t border-slate-800 py-5 text-center text-xs text-slate-500">© {new Date().getFullYear()} EventEase. Built with the MERN stack.</div>
    </footer>
  );
}
