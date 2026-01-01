import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');


    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            Swal.fire({
                icon: 'success',
                title: 'Welcome back!',
                text: 'Login successful',
                timer: 1500,
                showConfirmButton: false
            });
            navigate('/');
        } catch (err) {
            Swal.fire('Error', 'Invalid email or password', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', result: 'center', alignItems: 'center', height: '100vh', justifyContent: 'center' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '2rem', textDecoration: 'none' }}>
                <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <TrendingUp size={20} />
                </div>
                FinTrack
            </Link>
            <div className="card" style={{ width: '400px' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Login</h2>
                {error && <div className="text-danger" style={{ marginBottom: '1rem' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <div className="password-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ margin: 0 }} /* Override default margin */
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="password-toggle-btn"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {/* Add margin below the group since we removed it from input */}
                    <div style={{ marginBottom: '1rem' }}></div>
                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    <Link to="/forgot-password" style={{ color: 'var(--text-secondary)' }}>Forgot Password?</Link>
                </p>
                <p style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
