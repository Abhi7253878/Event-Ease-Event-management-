import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { CalendarDays, LayoutDashboard, Ticket, User, PlusCircle, ListChecks, Users, Shapes, LogOut, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Notifications } from '../components/Navbar';
const menus = {
  attendee: [['/dashboard', 'Dashboard', LayoutDashboard], ['/events', 'Discover Events', Search], ['/my-registrations', 'My Registrations', Ticket], ['/profile', 'My Profile', User]],
  organizer: [['/organizer', 'Dashboard', LayoutDashboard], ['/organizer/create', 'Create Event', PlusCircle], ['/organizer/events', 'Manage Events', ListChecks], ['/profile', 'My Profile', User]],
  admin: [['/admin', 'Dashboard', LayoutDashboard], ['/admin/users', 'Manage Users', Users], ['/admin/events', 'Manage Events', ListChecks], ['/admin/categories', 'Categories', Shapes], ['/profile', 'My Profile', User]],
};
export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const items = menus[user.role];
  const cls = ({ isActive }) => `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${isActive ? 'bg-brand-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`;
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b bg-white md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between p-4 md:block">
          <Link to="/" className="flex items-center gap-2 text-xl font-extrabold"><span className="rounded-lg bg-brand-600 p-1.5 text-white"><CalendarDays className="h-5 w-5" /></span>Event<span className="text-brand-600">Ease</span></Link>
          <span className="mt-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-brand-700 md:mt-4 md:inline-block">{user.role}</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:block md:space-y-1 md:overflow-visible md:pb-0">
          {items.map(([to, label, Icon]) => <NavLink key={to} to={to} end className={cls}><Icon className="h-5 w-5 shrink-0" /><span className="whitespace-nowrap">{label}</span></NavLink>)}
        </nav>
      </aside>
      <div className="flex-1">
        <div className="flex h-16 items-center justify-between border-b bg-white px-6">
          <p className="text-sm text-slate-500">Welcome back, <b className="text-slate-800">{user.name}</b></p>
          <div className="flex items-center gap-2"><Notifications /><button onClick={() => { logout(); nav('/'); }} className="btn-outline py-2"><LogOut className="h-4 w-4" />Logout</button></div>
        </div>
        <main className="p-4 md:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
