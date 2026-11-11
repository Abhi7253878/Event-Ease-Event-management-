import { useState } from 'react';
import api, { errMsg } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Spinner, ErrorBox, PageHeader, Empty, Badge, Table, ConfirmButton } from '../../components/UI';
import { fmtDate } from '../../utils/format';
export default function ManageUsers() {
  const { user: me } = useAuth(); const toast = useToast();
  const [search, setSearch] = useState(''); const [role, setRole] = useState('');
  const { data, loading, error, reload } = useFetch(`/admin/users?search=${encodeURIComponent(search)}&role=${role}`);
  const act = async (fn, msg) => { try { await fn(); toast.success(msg); reload(); } catch (e) { toast.error(errMsg(e)); } };
  return (<>
    <PageHeader title="Manage users" subtitle="Change roles, disable or remove accounts" />
    <div className="mb-4 flex gap-3"><input className="input max-w-xs" placeholder="Search name or email" value={search} onChange={e => setSearch(e.target.value)} /><select className="input max-w-[10rem]" value={role} onChange={e => setRole(e.target.value)}><option value="">All roles</option><option value="attendee">Attendee</option><option value="organizer">Organizer</option><option value="admin">Admin</option></select></div>
    {loading ? <Spinner /> : error ? <ErrorBox message={error} retry={reload} /> : data.users.length === 0 ? <Empty title="No users found" /> :
      <Table head={['User', 'Role', 'Joined', 'Status', 'Actions']}>{data.users.map(u => { const self = u._id === me._id; return (<tr key={u._id}>
        <td className="td font-semibold">{u.name}<div className="text-xs font-normal text-slate-400">{u.email}</div></td>
        <td className="td"><select disabled={self} className="input py-1.5" value={u.role} onChange={e => act(() => api.patch(`/admin/users/${u._id}`, { role: e.target.value }), 'Role updated')}><option value="attendee">attendee</option><option value="organizer">organizer</option><option value="admin">admin</option></select></td>
        <td className="td">{fmtDate(u.createdAt)}</td><td className="td"><Badge color={u.isActive ? 'green' : 'red'}>{u.isActive ? 'active' : 'disabled'}</Badge></td>
        <td className="td"><div className="flex gap-2"><button disabled={self} className="btn-outline px-3 py-1.5" onClick={() => act(() => api.patch(`/admin/users/${u._id}`, { isActive: !u.isActive }), u.isActive ? 'User disabled' : 'User enabled')}>{u.isActive ? 'Disable' : 'Enable'}</button>{!self && <ConfirmButton className="btn-danger px-3 py-1.5" message={`Delete ${u.name}?`} onConfirm={() => act(() => api.delete(`/admin/users/${u._id}`), 'User deleted')}>Delete</ConfirmButton>}</div></td>
      </tr>); })}</Table>}
  </>);
}
