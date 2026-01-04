import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Gift, Target, Trash2, TrendingUp, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import styles from '../components/DataTable.module.css'; // Reusing some table styles for headers if needed, or just inline.

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
                Swal.fire('congratulations!', 'You have reached your goal! An email has been sent.', 'success');
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

    if (loading) return <div className="p-4">Loading dreams...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">My Dreams & Wishlist</h1>
                    <p className="text-gray-500">Track savings for your future purchases</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={20} /> Add Dream
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dreams.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <Gift size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No dreams added yet. Start by adding one!</p>
                    </div>
                ) : (
                    dreams.map(dream => {
                        const progress = Math.min((parseFloat(dream.CurrentSaved) / parseFloat(dream.TargetAmount)) * 100, 100);
                        const isAchieved = parseFloat(dream.CurrentSaved) >= parseFloat(dream.TargetAmount);

                        return (
                            <div key={dream.DreamId} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
                                {isAchieved && (
                                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl-lg font-bold flex items-center gap-1">
                                        <CheckCircle size={12} /> ACHIEVED
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg text-purple-600 dark:text-purple-400">
                                        <Gift size={24} />
                                    </div>
                                    <button
                                        onClick={() => handleDelete(dream.DreamId)}
                                        className="text-gray-400 hover:text-red-500 transition"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <h3 className="text-xl font-bold mb-1">{dream.ItemName}</h3>
                                <p className="text-sm text-gray-500 mb-4">Target: ${parseFloat(dream.TargetAmount).toLocaleString()}</p>

                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                            ${parseFloat(dream.CurrentSaved).toLocaleString()}
                                        </span>
                                        <span className="text-gray-500">{progress.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className={`h-2.5 rounded-full ${isAchieved ? 'bg-green-500' : 'bg-blue-600'}`}
                                            style={{ width: `${progress}%`, transition: 'width 1s ease-in-out' }}
                                        ></div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => openFundModal(dream)}
                                    disabled={isAchieved}
                                    className={`w-full py-2 rounded-lg font-medium transition flex items-center justify-center gap-2
                                        ${isAchieved
                                            ? 'bg-green-100 text-green-700 cursor-default'
                                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                                        }`}
                                >
                                    {isAchieved ? 'Goal Reach!' : <><TrendingUp size={18} /> Add Funds</>}
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add Dream Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add New Dream</h2>
                        <form onSubmit={handleAddDream}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Item Name</label>
                                <input
                                    type="text"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="e.g. New Laptop"
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-1">Target Amount ($)</label>
                                <input
                                    type="number"
                                    value={newTargetAmount}
                                    onChange={(e) => setNewTargetAmount(e.target.value)}
                                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="e.g. 1500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-2">Add Funds</h2>
                        <p className="text-sm text-gray-500 mb-4">To: {selectedDream.ItemName}</p>
                        <form onSubmit={handleAddFunds}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-1">Amount to Add ($)</label>
                                <input
                                    type="number"
                                    value={fundAmount}
                                    onChange={(e) => setFundAmount(e.target.value)}
                                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="e.g. 50"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowFundModal(false)}
                                    className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Add Funds
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
