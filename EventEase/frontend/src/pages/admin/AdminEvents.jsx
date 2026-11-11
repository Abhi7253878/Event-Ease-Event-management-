import { Link } from 'react-router-dom';
import api, { errMsg } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import { Spinner, ErrorBox, PageHeader, Empty, Badge, statusColor, Table, ConfirmButton } from '../../components/UI';
import { fmtDate } from '../../utils/format';
export default function AdminEvents() {
  const toast = useToast(); const { data, loading, error, reload } = useFetch('/admin/events');
  const del = async id => { try { await api.delete(`/events/${id}`); toast.success('Event deleted'); reload(); } catch (e) { toast.error(errMsg(e)); } };
  const feature = async e => { try { await api.put(`/events/${e._id}`, { featured: !e.featured }); toast.success('Updated'); reload(); } catch (er) { toast.error(errMsg(er)); } };
  if (loading) return <Spinner />; if (error) return <ErrorBox message={error} retry={reload} />;
  return (<>
    <PageHeader title="Manage events" subtitle="Moderate every event on the platform" />
    {data.events.length === 0 ? <Empty title="No events" /> : <Table head={['Event', 'Organizer', 'Date', 'Registered', 'Status', 'Featured', '']}>{data.events.map(e => (<tr key={e._id}>
      <td className="td font-semibold"><Link to={`/events/${e._id}`} className="hover:text-brand-600">{e.title}</Link></td><td className="td">{e.organizer?.name}</td><td className="td">{fmtDate(e.date)}</td><td className="td">{e.registrationCount}/{e.capacity}</td><td className="td"><Badge color={statusColor(e.status)}>{e.status}</Badge></td>
      <td className="td"><button className="btn-outline px-3 py-1.5" onClick={() => feature(e)}>{e.featured ? '★ Featured' : '☆ Feature'}</button></td>
      <td className="td"><ConfirmButton className="btn-danger px-3 py-1.5" message="Delete this event permanently?" onConfirm={() => del(e._id)}>Delete</ConfirmButton></td>
    </tr>))}</Table>}
  </>);
}
