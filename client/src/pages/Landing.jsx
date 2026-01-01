import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, PieChart, TrendingUp, Smartphone } from 'lucide-react';

const Landing = () => {
    return (
        <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Navbar */}
            <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--primary)' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <TrendingUp size={20} />
                    </div>
                    FinTrack
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/login" className="btn" style={{ color: 'var(--text)', fontWeight: '600' }}>Login</Link>
                    <Link to="/register" className="btn btn-primary">Get Started</Link>
                </div>
            </nav>

            {/* Hero */}
            <header style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 2rem' }}>
                <div style={{ maxWidth: '800px' }}>
                    <h1 style={{ fontSize: '3.5rem', lineHeight: '1.1', marginBottom: '1.5rem', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Master Your Money,<br /> Master Your Life.
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                        The complete financial tracker built for modern life. Track income, manage expenses, and visualize your growth with our premium dashboard.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link to="/register" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Start for Free <ArrowRight size={20} />
                        </Link>
                        <Link to="/login" className="btn" style={{ border: '1px solid var(--border)', fontSize: '1.1rem', padding: '1rem 2rem' }}>
                            View Demo
                        </Link>
                    </div>
                </div>
            </header>

            {/* Features */}
            <section style={{ padding: '4rem 2rem', backgroundColor: 'var(--surface)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2rem' }}>Why FinTrack?</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#e0e7ff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <PieChart size={30} />
                            </div>
                            <h3>Visual Analytics</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>See exactly where your money goes with interactive charts and real-time breakdowns.</p>
                        </div>

                        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#dcfce7', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <ShieldCheck size={30} />
                            </div>
                            <h3>Secure & Private</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Your data is encrypted and stored securely. We prioritize your privacy above all.</p>
                        </div>

                        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fff7ed', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <Smartphone size={30} />
                            </div>
                            <h3>Mobile Friendly</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Access your dashboard from anywhere, on any device. Your finances, always at your fingertips.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', borderTop: '1px solid var(--border)' }}>
                <p>&copy; 2026 FinTrack. Built for financial freedom.</p>
            </footer>
        </div>
    );
};

export default Landing;
