import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import { Spinner, ErrorBox, PageHeader, Empty, Badge, statusColor, Table, ConfirmButton } from '../../components/UI';
import { fmtDateTime } from '../../utils/format';
export default function Participants() {
  const { id } = useParams(); const toast = useToast();
  const { data, loading, error, reload } = useFetch(`/registrations/event/${id}`);
  const cancel = async rid => { try { await api.delete(`/registrations/${rid}`); toast.success('Registration cancelled'); reload(); } catch (e) { toast.error(errMsg(e)); } };
  if (loading) return <Spinner />; if (error) return <ErrorBox message={error} retry={reload} />;
  const confirmed = data.registrations.filter(r => r.registrationStatus === 'confirmed').length;
  return (<>
    <Link to="/organizer/events" className="text-sm font-medium text-brand-600">← Back to events</Link>
    <PageHeader title={`Participants · ${data.event.title}`} subtitle={`${confirmed} confirmed of ${data.event.capacity} seats`} />
    {data.registrations.length === 0 ? <Empty title="No participants yet" /> :
      <Table head={['Name', 'Email', 'Phone', 'Reference', 'Registered', 'Status', '']}>{data.registrations.map(r => (<tr key={r._id}>
        <td className="td font-semibold">{r.user?.name}</td><td className="td">{r.user?.email}</td><td className="td">{r.user?.phone || '—'}</td><td className="td font-mono text-xs">{r.bookingReference}</td><td className="td">{fmtDateTime(r.registeredAt)}</td><td className="td"><Badge color={statusColor(r.registrationStatus)}>{r.registrationStatus}</Badge></td>
        <td className="td">{r.registrationStatus === 'confirmed' && <ConfirmButton className="btn-danger px-3 py-1.5" message="Cancel this participant's registration?" onConfirm={() => cancel(r._id)}>Cancel</ConfirmButton>}</td>
      </tr>))}</Table>}
  </>);
}
