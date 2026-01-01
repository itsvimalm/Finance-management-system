import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';

const Income = () => {
    const [transactions, setTransactions] = useState([]);
    const [formData, setFormData] = useState({
        Date: new Date().toISOString().split('T')[0],
        Source: '',
        Description: '',
        Amount: '',
        Mode: 'Bank',
        Month: new Date().toLocaleString('default', { month: 'long' }),
        FinancialYear: '2024-2025' // Hardcoded for demo, should calculate
    });

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/data/transactions?type=Income');
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
                await api.delete(`/data/transactions/${id}?type=Income`);
                setTransactions(transactions.filter(t => t.Id !== id));
                Swal.fire(
                    'Deleted!',
                    'Your record has been deleted.',
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
            const res = await api.post('/data/transactions', { ...formData, type: 'Income' });
            setTransactions([...transactions, res.data]);
            setFormData({ ...formData, Amount: '', Description: '', Source: '' });
            Swal.fire({
                icon: 'success',
                title: 'Saved',
                text: 'Income added successfully',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Failed to add income.', 'error');
        }
    };

    const columns = [
        { header: 'Date', accessor: 'Date', sortable: true },
        { header: 'Source', accessor: 'Source', sortable: true },
        { header: 'Description', accessor: 'Description', sortable: true },
        { header: 'Mode', accessor: 'Mode', sortable: true },
        {
            header: 'Amount',
            accessor: 'Amount',
            sortable: true,
            render: (row) => <span className="text-success">₹{row.Amount}</span>
        }
    ];

    return (
        <div>
            <h1>Income</h1>

            <div className="card mt-4">
                <h3>Add Income</h3>
                <form onSubmit={handleSubmit} className="flex gap-4" style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        <label>Date</label>
                        <input type="date" value={formData.Date} onChange={e => setFormData({ ...formData, Date: e.target.value })} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Source</label>
                        <select value={formData.Source} onChange={e => setFormData({ ...formData, Source: e.target.value })}>
                            <option value="">Select Source</option>
                            <option value="Salary">Salary</option>
                            <option value="Freelance">Freelance</option>
                            <option value="Business">Business</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div style={{ flex: 2 }}>
                        <label>Description</label>
                        <input type="text" placeholder="Description" value={formData.Description} onChange={e => setFormData({ ...formData, Description: e.target.value })} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Amount (₹)</label>
                        <input type="number" placeholder="0" value={formData.Amount} onChange={e => setFormData({ ...formData, Amount: e.target.value })} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Mode</label>
                        <select value={formData.Mode} onChange={e => setFormData({ ...formData, Mode: e.target.value })}>
                            <option value="Bank">Bank</option>
                            <option value="Cash">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="Card">Card</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginBottom: '1rem' }}>Add</button>
                </form>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <DataTable
                    columns={columns}
                    data={transactions}
                    searchPlaceholder="Search Income..."
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

export default Income;
