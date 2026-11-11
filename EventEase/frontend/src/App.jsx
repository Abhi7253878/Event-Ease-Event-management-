import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home'; import Explore from './pages/Explore'; import EventDetails from './pages/EventDetails';
import About from './pages/About'; import Contact from './pages/Contact'; import Login from './pages/Login'; import Register from './pages/Register'; import Profile from './pages/Profile';
import UserDashboard from './pages/attendee/UserDashboard'; import MyRegistrations from './pages/attendee/MyRegistrations'; import BookingDetails from './pages/attendee/BookingDetails';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard'; import CreateEvent from './pages/organizer/CreateEvent'; import ManageEvents from './pages/organizer/ManageEvents'; import EditEvent from './pages/organizer/EditEvent'; import Participants from './pages/organizer/Participants';
import AdminDashboard from './pages/admin/AdminDashboard'; import ManageUsers from './pages/admin/ManageUsers'; import AdminEvents from './pages/admin/AdminEvents'; import ManageCategories from './pages/admin/ManageCategories';

const D = ({ roles, children }) => <ProtectedRoute roles={roles}>{children}</ProtectedRoute>;
export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} /><Route path="/events" element={<Explore />} /><Route path="/events/:id" element={<EventDetails />} />
        <Route path="/about" element={<About />} /><Route path="/contact" element={<Contact />} /><Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} />
      </Route>
      <Route element={<D><DashboardLayout /></D>}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<D roles={['attendee']}><UserDashboard /></D>} />
        <Route path="/my-registrations" element={<D roles={['attendee']}><MyRegistrations /></D>} />
        <Route path="/bookings/:id" element={<BookingDetails />} />
        <Route path="/organizer" element={<D roles={['organizer']}><OrganizerDashboard /></D>} />
        <Route path="/organizer/create" element={<D roles={['organizer', 'admin']}><CreateEvent /></D>} />
        <Route path="/organizer/events" element={<D roles={['organizer']}><ManageEvents /></D>} />
        <Route path="/organizer/events/:id/edit" element={<D roles={['organizer', 'admin']}><EditEvent /></D>} />
        <Route path="/organizer/events/:id/participants" element={<D roles={['organizer', 'admin']}><Participants /></D>} />
        <Route path="/admin" element={<D roles={['admin']}><AdminDashboard /></D>} />
        <Route path="/admin/users" element={<D roles={['admin']}><ManageUsers /></D>} />
        <Route path="/admin/events" element={<D roles={['admin']}><AdminEvents /></D>} />
        <Route path="/admin/categories" element={<D roles={['admin']}><ManageCategories /></D>} />
      </Route>
      <Route path="*" element={<div className="flex min-h-screen flex-col items-center justify-center"><h1 className="text-6xl font-extrabold text-brand-600">404</h1><p className="mt-2 text-slate-500">Page not found</p><a href="/" className="btn-primary mt-6">Go home</a></div>} />
    </Routes>
  );
}
