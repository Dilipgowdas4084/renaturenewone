import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import EventRegister from './pages/EventRegister';
import Leaderboard from './pages/Leaderboard';
import NatureResources from './pages/NatureResources';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Login from './pages/Login';
import MemberDashboard from './pages/MemberDashboard';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminEvents from './pages/admin/AdminEvents';
import AdminEventForm from './pages/admin/AdminEventForm';
import AdminEventDetail from './pages/admin/AdminEventDetail';
import AdminResources from './pages/admin/AdminResources';
import AdminSettings from './pages/admin/AdminSettings';
import AdminPointsLeaderboard from './pages/admin/AdminPointsLeaderboard';
import AdminSiteContent from './pages/admin/AdminSiteContent';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/events/:id/register" element={<EventRegister />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/nature" element={<NatureResources />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        {/* Aliases */}
        <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Member */}
        <Route path="/profile" element={<ProtectedRoute allowedRoles={['admin','member']}><Profile /></ProtectedRoute>} />
        <Route path="/member-dashboard" element={<ProtectedRoute allowedRoles={['member']}><MemberDashboard /></ProtectedRoute>} />
        
        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="members" element={<AdminUsers />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="events/new" element={<AdminEventForm />} />
          <Route path="events/:id/edit" element={<AdminEventForm />} />
          <Route path="events/:id" element={<AdminEventDetail />} />
          <Route path="points" element={<AdminPointsLeaderboard />} />
          <Route path="leaderboard" element={<AdminPointsLeaderboard />} />
          <Route path="content" element={<AdminSiteContent />} />
          <Route path="resources" element={<AdminResources />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}