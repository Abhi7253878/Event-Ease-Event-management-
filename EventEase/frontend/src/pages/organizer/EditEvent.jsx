import { useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { PageHeader, Spinner, ErrorBox } from '../../components/UI';
import EventForm from './EventForm';
export default function EditEvent() {
  const { id } = useParams(); const { data, loading, error, reload } = useFetch(`/events/${id}`);
  if (loading) return <Spinner />; if (error) return <ErrorBox message={error} retry={reload} />;
  return <><PageHeader title="Edit event" subtitle={data.event.title} /><EventForm event={data.event} /></>;
}
