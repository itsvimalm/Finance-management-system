import { useState, useEffect } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';
import { Trash2, Users, FileText, X } from 'lucide-react';
import { format } from 'date-fns';
import DataTable from '../components/DataTable';
import Swal from 'sweetalert2';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'logs'
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'logs') fetchLogs();
    }, [activeTab]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/auth/users');
            setUsers(res.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/auth/logs');
            setLogs(res.data);
            setError(null);
        } catch (err) {
            console.error(err);
            // It's possible logs are empty or sheet doesn't exist yet, don't show error to user immediately if it's just empty
            if (err.response && err.response.status === 404) {
                setLogs([]); // Just empty
            } else {
                setError('Failed to fetch logs');
            }
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete user!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/auth/users/${id}`);
                setUsers(users.filter(user => user._id !== id));
                Swal.fire('Deleted!', 'User has been deleted.', 'success');
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'Failed to delete user', 'error');
            }
        }
    };

    const userColumns = [
        { header: 'Name', accessor: 'name', sortable: true },
        { header: 'Email', accessor: 'email', sortable: true },
        {
            header: 'Role',
            accessor: 'role',
            sortable: true,
            render: (row) => (
                <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    background: row.role === 'superadmin' ? 'var(--primary)' : 'var(--bg-secondary)',
                    color: row.role === 'superadmin' ? '#fff' : 'inherit',
                    fontSize: '0.8rem'
                }}>
                    {row.role}
                </span>
            )
        },
        {
            header: 'Created At',
            accessor: 'createdAt',
            sortable: true,
            render: (row) => new Date(row.createdAt).toLocaleDateString()
        }
    ];

    const logColumns = [
        {
            header: 'Timestamp',
            accessor: 'timestamp',
            sortable: true,
            render: (row) => format(new Date(row.timestamp), 'yyyy-MM-dd HH:mm:ss')
        },
        { header: 'User', accessor: 'userName', sortable: true },
        { header: 'Action', accessor: 'action', sortable: true },
        { header: 'Details', accessor: 'details', sortable: true }
    ];

    const TabButton = ({ id, label, icon }) => (
        <button
            onClick={() => { setActiveTab(id); setSelectedUser(null); }}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: activeTab === id ? 'var(--primary)' : 'var(--bg-secondary)',
                color: activeTab === id ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s'
            }}
        >
            {icon}
            {label}
        </button>
    );

    const UserDetailsModal = ({ user, onClose }) => {
        if (!user) return null;
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
            }}>
                <div style={{
                    background: 'var(--card-bg)', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '500px',
                    position: 'relative', border: '1px solid var(--border-color)'
                }}>
                    <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <X size={24} />
                    </button>
                    <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>User Details</h2>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div><strong>ID:</strong> <span style={{ color: 'var(--text-secondary)' }}>{user._id}</span></div>
                        <div><strong>Name:</strong> <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{user.name}</span></div>
                        <div><strong>Email:</strong> {user.email}</div>
                        <div><strong>Role:</strong> {user.role}</div>
                        <div><strong>Joined:</strong> {new Date(user.createdAt).toLocaleString()}</div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                        {user.role !== 'superadmin' && (
                            <button
                                onClick={() => { deleteUser(user._id); onClose(); }}
                                className="btn btn-danger"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
                            >
                                <Trash2 size={16} /> Delete User
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <TabButton id="users" label="Users" icon={<Users size={20} />} />
                <TabButton id="logs" label="Activity Logs" icon={<FileText size={20} />} />
            </div>

            {loading && <Loader fullScreen={false} />}
            {error && <div className="p-4 text-red-500">{error}</div>}

            {!loading && !error && activeTab === 'users' && (
                <DataTable
                    columns={userColumns}
                    data={users}
                    onRowClick={(user) => setSelectedUser(user)}
                    actions={(user) => (
                        user.role !== 'superadmin' && (
                            <button
                                onClick={(e) => { e.stopPropagation(); deleteUser(user._id); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                title="Delete User"
                            >
                                <Trash2 size={20} />
                            </button>
                        )
                    )}
                />
            )}

            {!loading && !error && activeTab === 'logs' && (
                <DataTable
                    columns={logColumns}
                    data={logs}
                    searchPlaceholder="Search logs..."
                />
            )}

            {selectedUser && <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
        </div>
    );
};

export default AdminDashboard;
