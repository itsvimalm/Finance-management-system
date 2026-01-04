import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Gift, Trash2, TrendingUp, CheckCircle } from 'lucide-react';
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
            Swal.fire('Success', 'Dream added successfully!', 'success');
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
                Swal.fire('Success', 'Funds added successfully!', 'success');
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
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
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

    if (loading) return <div className="p-4 text-center">Loading dreams...</div>;

    return (
        <div className="p-6" style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f8fafc, #e2e8f0)' }}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold mb-2" style={{ background: 'linear-gradient(90deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        My Dreams & Wishlist
                    </h1>
                    <p className="text-gray-500 font-medium">Visualize and achieve your financial goals 🚀</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-full text-white shadow-lg transform hover:scale-105 transition-all duration-300"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                >
                    <Plus size={20} /> <span className="font-semibold">Add New Dream</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {dreams.length === 0 ? (
                    <div className="col-span-full text-center py-16 rounded-3xl border-2 border-dashed border-gray-300 bg-white/50 backdrop-blur-sm">
                        <div className="bg-purple-100 p-6 rounded-full inline-block mb-4">
                            <Gift size={48} className="text-purple-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No dreams yet?</h3>
                        <p className="text-gray-500 mb-6">Start your journey by adding your first wishlist item!</p>
                        <button onClick={() => setShowAddModal(true)} className="text-blue-600 font-bold hover:underline">
                            + Create a Dream
                        </button>
                    </div>
                ) : (
                    dreams.map(dream => {
                        const progress = Math.min((parseFloat(dream.CurrentSaved) / parseFloat(dream.TargetAmount)) * 100, 100);
                        const isAchieved = parseFloat(dream.CurrentSaved) >= parseFloat(dream.TargetAmount);

                        return (
                            <div key={dream.DreamId}
                                className="group rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                                style={{
                                    background: 'white',
                                    border: '1px solid rgba(255,255,255,0.5)'
                                }}
                            >
                                <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, ${isAchieved ? '#10b981' : '#3b82f6'}, ${isAchieved ? '#34d399' : '#8b5cf6'})` }}></div>

                                {isAchieved && (
                                    <div className="absolute top-4 right-4 bg-green-100/80 backdrop-blur text-green-700 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm">
                                        <CheckCircle size={12} /> COMPLETED
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-4 rounded-2xl ${isAchieved ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                        <Gift size={28} />
                                    </div>
                                    <button
                                        onClick={() => handleDelete(dream.DreamId)}
                                        className="text-gray-300 hover:text-red-500 transition-colors p-2"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <h3 className="text-2xl font-bold mb-1 text-gray-800">{dream.ItemName}</h3>
                                <p className="text-sm text-gray-400 mb-6 font-medium uppercase tracking-wider">Target: ${parseFloat(dream.TargetAmount).toLocaleString()}</p>

                                <div className="mb-6">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-bold text-gray-700 text-lg">
                                            ${parseFloat(dream.CurrentSaved).toLocaleString()}
                                        </span>
                                        <span className={`font-bold ${isAchieved ? 'text-green-600' : 'text-blue-600'}`}>{progress.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                                        <div
                                            className="h-full rounded-full relative"
                                            style={{
                                                width: `${progress}%`,
                                                background: isAchieved ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                                                transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => openFundModal(dream)}
                                    disabled={isAchieved}
                                    className={`w-full py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2
                                        ${isAchieved
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-gray-900 text-white hover:bg-black hover:shadow-lg active:scale-95'
                                        }`}
                                >
                                    {isAchieved ? 'Goal Reach! 🎉' : <><TrendingUp size={18} /> Add Funds</>}
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add Dream Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all scale-100">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">✨ Add New Dream</h2>
                        <form onSubmit={handleAddDream}>
                            <div className="mb-5">
                                <label className="block text-sm font-bold text-gray-700 mb-2">What are you dreaming of?</label>
                                <input
                                    type="text"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                    placeholder="e.g. MacBook Pro M3"
                                    required
                                />
                            </div>
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Target Amount ($)</label>
                                <input
                                    type="number"
                                    value={newTargetAmount}
                                    onChange={(e) => setNewTargetAmount(e.target.value)}
                                    className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                    placeholder="e.g. 2000"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-6 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition-all"
                                >
                                    Create Dream
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Fund Dream Modal */}
            {showFundModal && selectedDream && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all scale-100">
                        <h2 className="text-2xl font-bold mb-2 text-gray-800">💰 Add Funds</h2>
                        <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                            Contributing to: <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{selectedDream.ItemName}</span>
                        </p>
                        <form onSubmit={handleAddFunds}>
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Amount to Add ($)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3.5 text-gray-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        value={fundAmount}
                                        onChange={(e) => setFundAmount(e.target.value)}
                                        className="w-full p-3 pl-8 border-2 border-gray-100 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none font-bold text-lg"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowFundModal(false)}
                                    className="px-6 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg hover:shadow-green-500/30 transition-all"
                                >
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
