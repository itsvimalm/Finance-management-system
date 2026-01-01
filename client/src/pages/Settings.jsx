import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Save, Moon, Sun } from 'lucide-react';
import Swal from 'sweetalert2';

const Settings = () => {
    const [settings, setSettings] = useState({
        MonthlySavingsGoal: '',
        BudgetAlertPercent: '',
        Currency: 'INR',
        Theme: 'light'
    });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/data/settings');
                setSettings(res.data);
                // Apply theme immediately
                if (res.data.Theme === 'dark') document.body.classList.add('dark');
                else document.body.classList.remove('dark');
            } catch (error) {
                console.error(error);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleThemeToggle = () => {
        const newTheme = settings.Theme === 'light' ? 'dark' : 'light';
        setSettings({ ...settings, Theme: newTheme });
        if (newTheme === 'dark') document.body.classList.add('dark');
        else document.body.classList.remove('dark');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/data/settings', settings);
            Swal.fire({
                icon: 'success',
                title: 'Saved',
                text: 'Settings saved successfully!',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Error saving settings.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px' }}>
            <h1>Settings</h1>
            {msg && <div style={{ marginBottom: '1rem', color: msg.includes('Error') ? 'var(--danger)' : 'var(--secondary)' }}>{msg}</div>}

            <div className="card mt-4">
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label>Application Theme</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                            <button type="button" onClick={handleThemeToggle} className="btn" style={{ border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {settings.Theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                                {settings.Theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label>Monthly Savings Goal (₹)</label>
                        <input name="MonthlySavingsGoal" type="number" value={settings.MonthlySavingsGoal} onChange={handleChange} placeholder="e.g. 20000" />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label>Budget Alert Threshold (%)</label>
                        <input name="BudgetAlertPercent" type="number" value={settings.BudgetAlertPercent} onChange={handleChange} placeholder="e.g. 80" />
                        <small style={{ color: 'var(--text-secondary)' }}>Get notified when category spending exceeds this %.</small>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label>Currency</label>
                        <select name="Currency" value={settings.Currency} onChange={handleChange}>
                            <option value="INR">Indian Rupee (₹)</option>
                            <option value="USD">US Dollar ($)</option>
                            <option value="EUR">Euro (€)</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;
