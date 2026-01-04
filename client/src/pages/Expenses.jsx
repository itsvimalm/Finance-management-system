import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';

const Expenses = () => {
    const [transactions, setTransactions] = useState([]);
    const [formData, setFormData] = useState({
        Date: new Date().toISOString().split('T')[0],
        Category: '',
        SubCategory: '',
        PaymentMethod: 'UPI',
        Amount: '',
        Month: new Date().toLocaleString('default', { month: 'long' }),
        FinancialYear: '2024-2025'
    });

    const [dreams, setDreams] = useState([]);
    const [savingsGoals, setSavingsGoals] = useState([]);

    useEffect(() => {
        fetchTransactions();
        fetchDreamsAndSavings();
    }, []);

    const fetchDreamsAndSavings = async () => {
        try {
            const [dreamsRes, savingsRes] = await Promise.all([
                api.get('/dreams'),
                api.get('/data/savings')
            ]);
            setDreams(dreamsRes.data);
            setSavingsGoals(savingsRes.data);
        } catch (error) {
            console.error("Failed to fetch dreams/savings for dropdown", error);
        }
    };

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/data/transactions?type=Expenses');
            setTransactions(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/data/transactions/${id}?type=Expenses`);
                setTransactions(transactions.filter(t => t.Id !== id));
                Swal.fire(
                    'Deleted!',
                    'Your expense has been deleted.',
                    'success'
                );
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Failed to delete record.', 'error');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // First, add the expense transaction
            const res = await api.post('/data/transactions', { ...formData, type: 'Expenses' });
            setTransactions([...transactions, res.data]);

            // Check if this expense is towards a Dream, if so, add funds to it
            if (formData.Category.startsWith('Dream: ')) {
                const dreamName = formData.Category.replace('Dream: ', '');
                const dream = dreams.find(d => d.ItemName === dreamName);
                if (dream) {
                    await api.post('/dreams/add-funds', {
                        dreamId: dream.DreamId,
                        amount: formData.Amount
                    });
                }
            }

            setFormData({ ...formData, Amount: '', Category: '', SubCategory: '' });
            Swal.fire({
                icon: 'success',
                title: 'Saved',
                text: 'Expense added & Dream updated successfully',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Failed to add expense.', 'error');
        }
    };

    const columns = [
        { header: 'Date', accessor: 'Date', sortable: true },
        { header: 'Category', accessor: 'Category', sortable: true },
        { header: 'Sub Category', accessor: 'SubCategory', sortable: true },
        { header: 'Method', accessor: 'PaymentMethod', sortable: true },
        {
            header: 'Amount',
            accessor: 'Amount',
            sortable: true,
            render: (row) => <span className="text-danger">₹{row.Amount}</span>
        }
    ];

    return (
        <div>
            <h1>Expenses</h1>

            <div className="card mt-4">
                <h3>Add Expense</h3>
                <form onSubmit={handleSubmit} className="flex gap-4" style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        <label>Date</label>
                        <input type="date" value={formData.Date} onChange={e => setFormData({ ...formData, Date: e.target.value })} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Category</label>
                        <select value={formData.Category} onChange={e => setFormData({ ...formData, Category: e.target.value })}>
                            <optgroup label="Standard Categories">
                                <option value="">Select Category</option>

                                <option value="Food">Food</option>
                                <option value="Transport">Transport</option>
                                <option value="Rent">Rent</option>
                                <option value="Utilities">Utilities</option>
                                <option value="Shopping">Shopping</option>
                                <option value="Health">Health</option>
                                <option value="Entertainment">Entertainment</option>
                            </optgroup>

                            {dreams.length > 0 && (
                                <optgroup label="Dreams / Wishlist">
                                    {dreams.map(dream => (
                                        <option key={dream.DreamId} value={`Dream: ${dream.ItemName}`}>
                                            Dream: {dream.ItemName}
                                        </option>
                                    ))}
                                </optgroup>
                            )}

                            {savingsGoals.length > 0 && (
                                <optgroup label="Savings Goals">
                                    {savingsGoals.map(goal => (
                                        <option key={goal.Id} value={`Saving: ${goal.Type}`}>
                                            Saving: {goal.Type}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Sub Category</label>
                        <input type="text" placeholder="e.g. Pizza" value={formData.SubCategory} onChange={e => setFormData({ ...formData, SubCategory: e.target.value })} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Amount (₹)</label>
                        <input type="number" placeholder="0" value={formData.Amount} onChange={e => setFormData({ ...formData, Amount: e.target.value })} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Payment Method</label>
                        <select value={formData.PaymentMethod} onChange={e => setFormData({ ...formData, PaymentMethod: e.target.value })}>
                            <option value="UPI">UPI</option>
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="Bank">Bank</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginBottom: '1rem' }}>Add</button>
                </form>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <DataTable
                    columns={columns}
                    data={transactions}
                    searchPlaceholder="Search Expenses..."
                    actions={(row) => (
                        <button onClick={() => handleDelete(row.Id)} className="text-danger" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                        </button>
                    )}
                />
            </div>
        </div>
    );
};

export default Expenses;
