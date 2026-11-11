import { Link } from 'react-router-dom';
import api, { errMsg } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import { Spinner, ErrorBox, PageHeader, Empty, Badge, statusColor, Table, ConfirmButton } from '../../components/UI';
import { fmtDate, fmtPrice } from '../../utils/format';
export default function MyRegistrations() {
  const { data, loading, error, reload } = useFetch('/registrations/my'); const toast = useToast();
  const cancel = async id => { try { await api.delete(`/registrations/${id}`); toast.success('Registration cancelled'); reload(); } catch (e) { toast.error(errMsg(e)); } };
  if (loading) return <Spinner />; if (error) return <ErrorBox message={error} retry={reload} />;
  return (<>
    <PageHeader title="My Registrations" subtitle="Your complete booking history" />
    {data.registrations.length === 0 ? <Empty title="No registrations yet" action={<Link to="/events" className="btn-primary">Explore events</Link>} /> :
      <Table head={['Event', 'Date', 'Price', 'Reference', 'Status', '']}>
        {data.registrations.map(r => (<tr key={r._id}>
          <td className="td font-semibold"><Link to={`/events/${r.event._id}`} className="hover:text-brand-600">{r.event.title}</Link></td>
          <td className="td">{fmtDate(r.event.date)}</td><td className="td">{fmtPrice(r.event.ticketPrice)}</td>
          <td className="td font-mono text-xs">{r.bookingReference}</td><td className="td"><Badge color={statusColor(r.registrationStatus)}>{r.registrationStatus}</Badge></td>
          <td className="td space-x-2 whitespace-nowrap"><Link to={`/bookings/${r._id}`} className="btn-outline px-3 py-1.5">Details</Link>{r.registrationStatus === 'confirmed' && <ConfirmButton className="btn-danger px-3 py-1.5" message="Cancel this registration?" onConfirm={() => cancel(r._id)}>Cancel</ConfirmButton>}</td>
        </tr>))}
      </Table>}
  </>);
}
