import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, TrendingUp, PiggyBank, Settings, LogOut, Menu, X, Shield, Gift } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    const { pathname } = useLocation();
    const { logout, user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    const links = [
        { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/income', label: 'Income', icon: <Wallet size={20} /> },
        { path: '/expenses', label: 'Expenses', icon: <TrendingUp size={20} /> },
        { path: '/budget', label: 'Budget', icon: <PiggyBank size={20} /> },
        { path: '/savings', label: 'Savings', icon: <TrendingUp size={20} /> },
        { path: '/dreams', label: 'Dreams', icon: <Gift size={20} /> },
        { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
    ];

    if (user?.role === 'superadmin') {
        links.push({ path: '/admin', label: 'Admin', icon: <Shield size={20} /> });
    }

    return (
        <div className={styles.sidebar}>
            <div className={styles.logo}>
                <h2>CellFinanc</h2>
                <button className={styles.mobileToggle} onClick={toggleMenu}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            <nav className={`${styles.nav} ${isOpen ? styles.open : ''}`}>
                {links.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`${styles.link} ${pathname === link.path ? styles.active : ''}`}
                        onClick={closeMenu}
                    >
                        {link.icon}
                        <span>{link.label}</span>
                    </Link>
                ))}

                {/* Mobile Logout Button (inside nav) */}
                <button onClick={logout} className={`${styles.logoutBtn} ${styles.mobileLogout}`} style={{ marginTop: 'auto' }}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
                <div className={styles.mobileCopyright} style={{ textAlign: 'center', fontSize: '0.75rem', opacity: 0.5, padding: '1rem 0' }}>
                    &copy; 2026 CellFinanc
                </div>
            </nav>

            {/* Desktop Logout Button (outside nav) */}
            <button onClick={logout} className={styles.logoutBtn} style={{ display: isOpen ? 'none' : 'flex' }}>
                {/* Logic handled by CSS mostly, but this ensures no duplicate on desktop if CSS fails */}
                <LogOut size={20} />
                <span>Logout</span>
            </button>

            <div className={styles.desktopCopyright} style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.5, textAlign: 'center', display: isOpen ? 'none' : 'block' }}>
                &copy; 2026 CellFinanc
            </div>
        </div>
    );
};

export default Sidebar;
