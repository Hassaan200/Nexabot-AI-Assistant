import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
// import Bookings from './pages/Bookings';
// import Conversations from './pages/Conversations';

const ProtectedLayout = ({ children }) => {
  const { client, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!client) return <Navigate to="/login" />;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedLayout><Dashboard /></ProtectedLayout>
          } />
          {/* <Route path="/bookings" element={
            <ProtectedLayout><Bookings /></ProtectedLayout>
          } />
          <Route path="/conversations" element={
            <ProtectedLayout><Conversations /></ProtectedLayout>
          } /> */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}