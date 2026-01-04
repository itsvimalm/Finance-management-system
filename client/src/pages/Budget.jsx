import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Trash2, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const Budget = () => {
    const [budgets, setBudgets] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [formData, setFormData] = useState({ Category: '', MonthlyBudget: '' });
    const [currency, setCurrency] = useState('₹');

    const [dreams, setDreams] = useState([]);
    const [savingsGoals, setSavingsGoals] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [budRes, expRes, setRes, dreamsRes, savingsRes] = await Promise.all([
                    api.get('/data/budget'),
                    api.get('/data/transactions?type=Expenses'),
                    api.get('/data/settings'),
                    api.get('/dreams'),
                    api.get('/savings')
                ]);
                setBudgets(budRes.data);
                setExpenses(expRes.data);
                setDreams(dreamsRes.data);
                setSavingsGoals(savingsRes.data);

                if (setRes.data.Currency === 'USD') setCurrency('$');
                else if (setRes.data.Currency === 'EUR') setCurrency('€');
                else setCurrency('₹');
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    // ...
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/data/budget', formData);
            const exists = budgets.find(b => b.Category === formData.Category);
            if (exists) {
                setBudgets(budgets.map(b => b.Category === formData.Category ? res.data : b));
            } else {
                setBudgets([...budgets, res.data]);
            }
            setFormData({ Category: '', MonthlyBudget: '' });
            Swal.fire({
                icon: 'success',
                title: 'Saved',
                text: 'Budget updated successfully',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Failed to update budget.', 'error');
        }
    };

    // Calculate spent per category
    const expenseByCategory = expenses.reduce((acc, curr) => {
        const cat = curr.Category || 'Other';
        acc[cat] = (acc[cat] || 0) + parseFloat(curr.Amount);
        return acc;
    }, {});


    return (
        <div>
            <h1>Budget Settings</h1>
            <div className="card mt-4">
                <form onSubmit={handleSubmit} className="flex gap-4 items-end" style={{ flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label>Category</label>
                        <select value={formData.Category} onChange={e => setFormData({ ...formData, Category: e.target.value })}>
                            <option value="">Select Category</option>
                            <optgroup label="Standard Categories">
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
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label>Monthly Limit ({currency})</label>
                        <input type="number" value={formData.MonthlyBudget} onChange={e => setFormData({ ...formData, MonthlyBudget: e.target.value })} />
                    </div>
                    <button type="submit" className="btn btn-primary mb-4" style={{ marginBottom: '1rem' }}>Set Budget</button>
                </form>
            </div>

            <div className="card mt-4">
                <h3>Current Budgets</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                    {budgets.map(b => {
                        const spent = expenseByCategory[b.Category] || 0;
                        const budget = parseFloat(b.MonthlyBudget);
                        const progress = Math.min((spent / budget) * 100, 100);
                        const isOver = spent > budget;
                        const color = isOver ? 'var(--danger)' : (progress > 80 ? 'var(--warning)' : 'var(--secondary)');

                        return (
                            <div key={b.Id || b.Category}>
                                <div className="flex justify-between mb-1">
                                    <span style={{ fontWeight: '500' }}>{b.Category}</span>
                                    <span>{currency}{spent} / {currency}{budget}</span>
                                </div>
                                <div style={{ height: '10px', width: '100%', backgroundColor: 'var(--border)', borderRadius: '5px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${progress}%`, backgroundColor: color, transition: 'width 0.5s ease' }}></div>
                                </div>
                                {isOver && (
                                    <div className="flex items-center gap-1 text-danger mt-1" style={{ fontSize: '0.85rem' }}>
                                        <AlertCircle size={14} />
                                        <span>Budget Exceeded!</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {budgets.length === 0 && <p className="text-secondary">No budgets set yet.</p>}
                </div>
            </div>
        </div>
    );
};

export default Budget;
