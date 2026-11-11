import { Link } from 'react-router-dom';
import { Pencil, Users, Trash2, PlusCircle } from 'lucide-react';
import api, { errMsg } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Spinner, ErrorBox, PageHeader, Empty, Badge, statusColor, Table, ConfirmButton } from '../../components/UI';
import { fmtDate, fmtPrice } from '../../utils/format';
export default function ManageEvents() {
  const { user } = useAuth(); const toast = useToast();
  const { data, loading, error, reload } = useFetch(`/events?organizer=${user._id}&limit=50&status=all`);
  const del = async id => { try { await api.delete(`/events/${id}`); toast.success('Event deleted'); reload(); } catch (e) { toast.error(errMsg(e)); } };
  if (loading) return <Spinner />; if (error) return <ErrorBox message={error} retry={reload} />;
  return (<>
    <PageHeader title="Manage events" subtitle="Edit, delete and track your events" action={<Link to="/organizer/create" className="btn-primary"><PlusCircle className="h-4 w-4" />New event</Link>} />
    {data.events.length === 0 ? <Empty title="No events yet" action={<Link to="/organizer/create" className="btn-primary">Create event</Link>} /> :
      <Table head={['Event', 'Date', 'Price', 'Registered', 'Status', 'Actions']}>{data.events.map(e => (<tr key={e._id}>
        <td className="td font-semibold"><Link to={`/events/${e._id}`} className="hover:text-brand-600">{e.title}</Link></td><td className="td">{fmtDate(e.date)}</td><td className="td">{fmtPrice(e.ticketPrice)}</td><td className="td">{e.registrationCount}/{e.capacity}</td><td className="td"><Badge color={statusColor(e.status)}>{e.status}</Badge></td>
        <td className="td"><div className="flex gap-2"><Link to={`/organizer/events/${e._id}/participants`} className="btn-outline p-2" title="Participants"><Users className="h-4 w-4" /></Link><Link to={`/organizer/events/${e._id}/edit`} className="btn-outline p-2" title="Edit"><Pencil className="h-4 w-4" /></Link><ConfirmButton className="btn-danger p-2" message="Delete this event and all its registrations?" onConfirm={() => del(e._id)}><Trash2 className="h-4 w-4" /></ConfirmButton></div></td>
      </tr>))}</Table>}
  </>);
}
