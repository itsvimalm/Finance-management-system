import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    // ...
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(name, email, password);
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Account created successfully',
                timer: 1500,
                showConfirmButton: false
            });
            navigate('/');
        } catch (err) {
            Swal.fire('Error', 'Registration failed. Try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh', justifyContent: 'center' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '2rem', textDecoration: 'none' }}>
                <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <TrendingUp size={20} />
                </div>
                FinTrack
            </Link>
            <div className="card" style={{ width: '400px' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Register</h2>
                {error && <div className="text-danger" style={{ marginBottom: '1rem' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
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
                            style={{ margin: 0 }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="password-toggle-btn"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <div style={{ marginBottom: '1rem' }}></div>
                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <p style={{ marginTop: '1rem', textAlign: 'center' }}>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
