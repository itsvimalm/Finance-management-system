import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Budget from './pages/Budget';
import Savings from './pages/Savings';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import { useAuth } from './context/AuthContext';
import Loader from './components/Loader';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const Layout = () => {
    const { user } = useAuth();
    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-content">
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {user && <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>Welcome {user.name} 👋</h2>}
                </div>
                <Outlet />
            </div>
        </div>
    );
};

const HomeRoute = () => {
    const { user, loading } = useAuth();
    if (loading) return <Loader />;
    return user ? <Navigate to="/dashboard" /> : <Landing />;
};

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <Loader />;
    return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <Loader />;
    return user && user.role === 'superadmin' ? children : <Navigate to="/dashboard" />;
};

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            <Route element={<Layout />}>
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/income" element={<PrivateRoute><Income /></PrivateRoute>} />
                <Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
                <Route path="/budget" element={<PrivateRoute><Budget /></PrivateRoute>} />
                <Route path="/savings" element={<PrivateRoute><Savings /></PrivateRoute>} />
                <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                {/* Add Budget and Savings later */}
                <Route path="*" element={<Navigate to="/" />} />
            </Route>
        </Routes>
    );
};

export default App;
