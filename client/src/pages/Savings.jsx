import { useState, useEffect } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';

const Savings = () => {
    const [savings, setSavings] = useState([]);
    const [formData, setFormData] = useState({
        Type: 'Goal',
        MonthlyAmount: '',
        GoalAmount: '',
        StartDate: new Date().toISOString().split('T')[0],
        ExpectedReturn: ''
    });

    useEffect(() => {
        const fetchSavings = async () => {
            try {
                const res = await api.get('/data/savings');
                setSavings(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchSavings();
    }, []);


    // ...
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/data/savings', formData);
            setSavings([...savings, res.data]);
            setFormData({ ...formData, MonthlyAmount: '', GoalAmount: '', ExpectedReturn: '' });
            Swal.fire({
                icon: 'success',
                title: 'Saved',
                text: 'Goal added successfully',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Failed to add savings goal.', 'error');
        }
    };

    return (
        <div>
            <h1>Savings & Investments</h1>
            <div className="card mt-4">
                <h3>Add New Goal / Investment</h3>
                <form onSubmit={handleSubmit} className="flex gap-4" style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="flex-1">
                        <label>Type</label>
                        <select value={formData.Type} onChange={e => setFormData({ ...formData, Type: e.target.value })}>
                            <option value="Emergency Fund">Emergency Fund</option>
                            <option value="FD">FD</option>
                            <option value="SIP">SIP</option>
                            <option value="Stocks">Stocks</option>
                            <option value="Gold">Gold</option>
                            <option value="Goal">Custom Goal</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label>Monthly Contribution (₹)</label>
                        <input type="number" value={formData.MonthlyAmount} onChange={e => setFormData({ ...formData, MonthlyAmount: e.target.value })} />
                    </div>
                    <div className="flex-1">
                        <label>Target Amount (₹)</label>
                        <input type="number" value={formData.GoalAmount} onChange={e => setFormData({ ...formData, GoalAmount: e.target.value })} />
                    </div>
                    <div className="flex-1">
                        <label>Expected Return (%)</label>
                        <input type="number" value={formData.ExpectedReturn} onChange={e => setFormData({ ...formData, ExpectedReturn: e.target.value })} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginBottom: '1rem' }}>Add</button>
                </form>
            </div>

            <div className="card mt-4">
                <h3>Your Portfolio</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Monthly</th>
                            <th>Target</th>
                            <th>Return</th>
                        </tr>
                    </thead>
                    <tbody>
                        {savings.map(s => (
                            <tr key={s.Id}>
                                <td>{s.Type}</td>
                                <td>₹{s.MonthlyAmount}</td>
                                <td>₹{s.GoalAmount}</td>
                                <td className="text-success">{s.ExpectedReturn}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Savings;
