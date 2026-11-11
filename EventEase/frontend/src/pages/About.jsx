import { Target, ShieldCheck, Zap, Users } from 'lucide-react';
export default function About() {
  const f = [[Target, 'Our mission', 'Make event discovery and management effortless for everyone.'], [ShieldCheck, 'Trusted & secure', 'JWT authentication, hashed passwords and role-based access.'], [Zap, 'Fast booking', 'Atomic seat reservation prevents double-booking and overbooking.'], [Users, 'Built for communities', 'Attendees, organizers and admins each get a purpose-built dashboard.']];
  return (<div className="mx-auto max-w-5xl px-4 py-16">
    <h1 className="text-4xl font-extrabold">About <span className="text-brand-600">EventEase</span></h1>
    <p className="mt-4 max-w-2xl text-lg text-slate-600">EventEase is a full-stack event management platform built with MongoDB, Express, React and Node.js. It connects attendees with great events and gives organizers the tools to run them.</p>
    <div className="mt-10 grid gap-6 md:grid-cols-2">{f.map(([I, t, d]) => <div key={t} className="card p-6"><I className="mb-3 h-8 w-8 text-brand-600" /><h3 className="font-bold">{t}</h3><p className="mt-1 text-sm text-slate-500">{d}</p></div>)}</div>
  </div>);
}
