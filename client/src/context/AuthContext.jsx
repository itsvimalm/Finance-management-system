import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAndApplyTheme = async () => {
        try {
            const res = await api.get('/data/settings');
            if (res.data && res.data.Theme === 'dark') {
                document.body.classList.add('dark');
            } else {
                document.body.classList.remove('dark');
            }
        } catch (error) {
            console.error("Failed to load theme settings", error);
        }
    };

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
            // Fetch theme if user is logged in
            fetchAndApplyTheme();
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        if (res.data) {
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);
            await fetchAndApplyTheme();
        }
        return res.data;
    };

    const register = async (name, email, password) => {
        const res = await api.post('/auth/register', { name, email, password });
        if (res.data) {
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);
            await fetchAndApplyTheme();
        }
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        document.body.classList.remove('dark'); // Reset to default (light) on logout
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
