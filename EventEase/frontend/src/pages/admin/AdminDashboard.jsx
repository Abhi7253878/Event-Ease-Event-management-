import { Users, CalendarDays, Ticket, Briefcase } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import useFetch from '../../hooks/useFetch';
import { Spinner, ErrorBox, StatCard, PageHeader, Badge, statusColor, Table } from '../../components/UI';
import { fmtDateTime } from '../../utils/format';
export default function AdminDashboard() {
  const { data, loading, error, reload } = useFetch('/admin/dashboard');
  if (loading) return <Spinner />; if (error) return <ErrorBox message={error} retry={reload} />;
  const s = data.stats;
  return (<>
    <PageHeader title="Admin Dashboard" subtitle="Platform overview" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={Users} label="Total users" value={s.users} /><StatCard icon={CalendarDays} label="Total events" value={s.events} tint="bg-sky-50 text-sky-600" /><StatCard icon={Ticket} label="Registrations" value={s.registrations} tint="bg-emerald-50 text-emerald-600" /><StatCard icon={Briefcase} label="Active organizers" value={s.activeOrganizers} tint="bg-amber-50 text-amber-600" /></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="card p-5"><h3 className="mb-4 font-bold">Registration analytics (7 days)</h3><ResponsiveContainer width="100%" height={250}><AreaChart data={data.trend}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="date" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip /><Area type="monotone" dataKey="registrations" stroke="#4f46e5" fill="#c7d2fe" strokeWidth={3} /></AreaChart></ResponsiveContainer></div>
      <div className="card p-5"><h3 className="mb-4 font-bold">Events by category</h3><ResponsiveContainer width="100%" height={250}><BarChart data={data.byCategory}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="name" fontSize={10} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip /><Bar dataKey="events" fill="#7c3aed" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
    </div>
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <div><h2 className="mb-3 text-lg font-bold">Recent users</h2><Table head={['Name', 'Role', 'Joined']}>{data.recentUsers.map(u => <tr key={u._id}><td className="td font-medium">{u.name}<div className="text-xs text-slate-400">{u.email}</div></td><td className="td"><Badge color={statusColor(u.role)}>{u.role}</Badge></td><td className="td">{fmtDateTime(u.createdAt)}</td></tr>)}</Table></div>
      <div><h2 className="mb-3 text-lg font-bold">Recent activity</h2><Table head={['User', 'Event', 'Status']}>{data.recentRegs.map(r => <tr key={r._id}><td className="td font-medium">{r.user?.name}</td><td className="td">{r.event?.title}</td><td className="td"><Badge color={statusColor(r.registrationStatus)}>{r.registrationStatus}</Badge></td></tr>)}</Table></div>
    </div>
  </>);
}
