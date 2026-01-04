import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Gift, Trash2, TrendingUp, CheckCircle, Target } from 'lucide-react';
import Swal from 'sweetalert2';

const Dreams = () => {
    const [dreams, setDreams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showFundModal, setShowFundModal] = useState(false);
    const [selectedDream, setSelectedDream] = useState(null);

    // Form States
    const [newItemName, setNewItemName] = useState('');
    const [newTargetAmount, setNewTargetAmount] = useState('');
    const [fundAmount, setFundAmount] = useState('');

    useEffect(() => {
        fetchDreams();
    }, []);

    const fetchDreams = async () => {
        try {
            const res = await api.get('/dreams');
            setDreams(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleAddDream = async (e) => {
        e.preventDefault();
        try {
            await api.post('/dreams', { ItemName: newItemName, TargetAmount: newTargetAmount });
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Dream added successfully!',
                timer: 1500,
                showConfirmButton: false
            });
            setShowAddModal(false);
            setNewItemName('');
            setNewTargetAmount('');
            fetchDreams();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to add dream', 'error');
        }
    };

    const handleAddFunds = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/dreams/add-funds', { dreamId: selectedDream.DreamId, amount: fundAmount });

            if (res.data.emailSent) {
                Swal.fire('Congratulations!', 'You have reached your goal! An email has been sent.', 'success');
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Funds Added',
                    text: 'Successfully added funds to your dream.',
                    timer: 1500,
                    showConfirmButton: false
                });
            }

            setShowFundModal(false);
            setFundAmount('');
            setSelectedDream(null);
            fetchDreams();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to add funds', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--danger)',
            cancelButtonColor: 'var(--text-secondary)',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/dreams/${id}`);
                Swal.fire('Deleted!', 'Your dream has been deleted.', 'success');
                fetchDreams();
            } catch (error) {
                Swal.fire('Error', 'Failed to delete dream', 'error');
            }
        }
    };

    const openFundModal = (dream) => {
        setSelectedDream(dream);
        setShowFundModal(true);
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dreams...</div>;

    const modalStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
    };

    const modalContentStyle = {
        backgroundColor: 'var(--surface)',
        padding: '2rem',
        borderRadius: 'var(--radius)',
        width: '100%',
        maxWidth: '400px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border)',
        color: 'var(--text)'
    };

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>My Dreams & Wishlist</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Track savings for your future purchases</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus size={20} /> Add Dream
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {dreams.length === 0 ? (
                    <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }}>
                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1.5rem', borderRadius: '50%', display: 'inline-flex', marginBottom: '1rem' }}>
                            <Gift size={48} style={{ color: 'var(--primary)' }} />
                        </div>
                        <h3>No dreams yet?</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Start your journey by adding your first wishlist item!</p>
                        <button onClick={() => setShowAddModal(true)} style={{ color: 'var(--primary)', fontWeight: '600', background: 'none' }}>
                            + Create a Dream
                        </button>
                    </div>
                ) : (
                    dreams.map(dream => {
                        const progress = Math.min((parseFloat(dream.CurrentSaved) / parseFloat(dream.TargetAmount)) * 100, 100);
                        const isAchieved = parseFloat(dream.CurrentSaved) >= parseFloat(dream.TargetAmount);

                        return (
                            <div key={dream.DreamId} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                                {isAchieved && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        background: 'var(--secondary)',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        padding: '0.25rem 0.75rem',
                                        borderBottomLeftRadius: 'var(--radius)',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        zIndex: 1
                                    }}>
                                        <CheckCircle size={12} /> ACHIEVED
                                    </div>
                                )}

                                <div className="flex justify-between items-start" style={{ marginBottom: '1rem' }}>
                                    <div style={{
                                        background: isAchieved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius)',
                                        color: isAchieved ? 'var(--secondary)' : 'var(--primary)'
                                    }}>
                                        {isAchieved ? <CheckCircle size={24} /> : <Gift size={24} />}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(dream.DreamId)}
                                        style={{ color: 'var(--text-secondary)', background: 'none', padding: '0.5rem' }}
                                        className="hover-danger"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{dream.ItemName}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Target size={14} /> Target: ₹{parseFloat(dream.TargetAmount).toLocaleString('en-IN')}
                                </p>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div className="flex justify-between" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: '600' }}>
                                            ₹{parseFloat(dream.CurrentSaved).toLocaleString('en-IN')}
                                        </span>
                                        <span style={{ color: isAchieved ? 'var(--secondary)' : 'var(--primary)', fontWeight: '600' }}>
                                            {progress.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div style={{ width: '100%', background: 'var(--border)', borderRadius: '999px', height: '0.5rem', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                height: '100%',
                                                width: `${progress}%`,
                                                background: isAchieved ? 'var(--secondary)' : 'var(--primary)',
                                                borderRadius: '999px',
                                                transition: 'width 0.5s ease'
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => openFundModal(dream)}
                                    disabled={isAchieved}
                                    className="btn"
                                    style={{
                                        width: '100%',
                                        background: isAchieved ? 'var(--background)' : 'var(--primary)',
                                        color: isAchieved ? 'var(--text-secondary)' : 'white',
                                        cursor: isAchieved ? 'default' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        opacity: isAchieved ? 0.7 : 1
                                    }}
                                >
                                    {isAchieved ? 'Goal Reached! 🎉' : <><TrendingUp size={18} /> Add Funds</>}
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add Dream Modal */}
            {showAddModal && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <h2>Add New Dream</h2>
                        <form onSubmit={handleAddDream}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Item Name</label>
                                <input
                                    type="text"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    placeholder="e.g. MacBook Pro M3"
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Target Amount (₹)</label>
                                <input
                                    type="number"
                                    value={newTargetAmount}
                                    onChange={(e) => setNewTargetAmount(e.target.value)}
                                    placeholder="e.g. 150000"
                                    required
                                />
                            </div>
                            <div className="flex justify-between gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    style={{ background: 'none', color: 'var(--text-secondary)', padding: '0.75rem' }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    Create Dream
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Fund Dream Modal */}
            {showFundModal && selectedDream && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <h2>Add Funds</h2>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                            Contributing to: <strong>{selectedDream.ItemName}</strong>
                        </p>
                        <form onSubmit={handleAddFunds}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Amount to Add (₹)</label>
                                <input
                                    type="number"
                                    value={fundAmount}
                                    onChange={(e) => setFundAmount(e.target.value)}
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div className="flex justify-between gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowFundModal(false)}
                                    style={{ background: 'none', color: 'var(--text-secondary)', padding: '0.75rem' }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn" style={{ flex: 1, background: 'var(--secondary)', color: 'white' }}>
                                    Confirm Transfer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dreams;
