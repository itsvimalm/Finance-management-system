import { useEffect, useState } from 'react';
import api from '../api/axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ArrowUpCircle, ArrowDownCircle, Banknote, Activity, TrendingUp } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import Loader from '../components/Loader';

const Dashboard = () => {
    const [income, setIncome] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currency, setCurrency] = useState('₹');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [incRes, expRes, budRes, setRes] = await Promise.all([
                    api.get('/data/transactions?type=Income'),
                    api.get('/data/transactions?type=Expenses'),
                    api.get('/data/budget'),
                    api.get('/data/settings')
                ]);
                setIncome(incRes.data);
                setExpenses(expRes.data);
                setBudgets(budRes.data);
                if (setRes.data.Currency === 'USD') setCurrency('$');
                else if (setRes.data.Currency === 'EUR') setCurrency('€');
                else setCurrency('₹');

            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalIncome = income.reduce((acc, curr) => acc + parseFloat(curr.Amount || 0), 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + parseFloat(curr.Amount || 0), 0);
    const balance = totalIncome - totalExpenses;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

    // 1. Pie Chart Data
    const expenseByCategory = expenses.reduce((acc, curr) => {
        const cat = curr.Category || 'Other';
        acc[cat] = (acc[cat] || 0) + parseFloat(curr.Amount);
        return acc;
    }, {});
    const pieData = Object.keys(expenseByCategory).map(key => ({ name: key, value: expenseByCategory[key] }));

    // 2. Budget vs Actual Data
    const budgetData = budgets.map(b => {
        const spent = expenseByCategory[b.Category] || 0;
        return {
            name: b.Category,
            Budget: parseFloat(b.MonthlyBudget),
            Actual: spent
        };
    });

    // 3. Recent Transactions
    const allTransactions = [
        ...income.map(i => ({ ...i, type: 'Income' })),
        ...expenses.map(e => ({ ...e, type: 'Expense' }))
    ].sort((a, b) => new Date(b.Date) - new Date(a.Date)).slice(0, 5);

    // 4. Line Chart Data (Daily Trend for current month)
    const processTrendData = () => {
        const today = new Date();
        const start = startOfMonth(today);
        const end = endOfMonth(today);
        const days = eachDayOfInterval({ start, end });

        return days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const inc = income
                .filter(i => i.Date === dateStr)
                .reduce((sum, curr) => sum + parseFloat(curr.Amount), 0);
            const exp = expenses
                .filter(e => e.Date === dateStr)
                .reduce((sum, curr) => sum + parseFloat(curr.Amount), 0);
            return {
                date: format(day, 'd MMM'),
                Income: inc,
                Expense: exp
            };
        });
    };
    const trendData = processTrendData();


    if (loading) return <Loader fullScreen={false} />;

    return (
        <div>
            <h1>Dashboard</h1>

            <div className="flex gap-4" style={{ marginTop: '1rem', flexWrap: 'wrap' }}>
                <div className="card flex-1">
                    <div className="flex items-center gap-2 text-secondary">
                        <ArrowUpCircle />
                        <h3>Income</h3>
                    </div>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{currency}{totalIncome.toLocaleString()}</p>
                </div>
                <div className="card flex-1">
                    <div className="flex items-center gap-2 text-danger">
                        <ArrowDownCircle />
                        <h3>Expenses</h3>
                    </div>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{currency}{totalExpenses.toLocaleString()}</p>
                </div>
                <div className="card flex-1">
                    <div className="flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                        <Banknote />
                        <h3>Balance</h3>
                    </div>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{currency}{balance.toLocaleString()}</p>
                </div>
            </div>

            <div className="card mt-4" style={{ height: '400px' }}>
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={20} />
                    <h3>Monthly Financial Trend</h3>
                </div>
                <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${currency}${value}`} />
                        <Legend />
                        <Line type="monotone" dataKey="Income" stroke="#10b981" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="Expense" stroke="#ef4444" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="flex gap-4 mt-4" style={{ flexWrap: 'wrap' }}>
                <div className="card flex-1" style={{ minWidth: '350px', height: '400px' }}>
                    <h3>Expense Breakdown</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${currency}${value}`} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="card flex-1" style={{ minWidth: '350px', height: '400px' }}>
                    <h3>Budget vs Actual</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={budgetData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `${currency}${value}`} />
                            <Legend />
                            <Bar dataKey="Budget" fill="#8884d8" name="Budget Limit" />
                            <Bar dataKey="Actual" fill="#82ca9d" name="Actual Spent" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card mt-4">
                <div className="flex items-center gap-2 mb-4">
                    <Activity size={20} />
                    <h3>Recent Activity</h3>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Type</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allTransactions.map((t, i) => (
                            <tr key={i}>
                                <td>{t.Date}</td>
                                <td>{t.Description || t.SubCategory || t.Category}</td>
                                <td>
                                    <span className={t.type === 'Income' ? 'text-success' : 'text-danger'}>
                                        {t.type}
                                    </span>
                                </td>
                                <td className={t.type === 'Income' ? 'text-success' : 'text-danger'}>
                                    {t.type === 'Income' ? '+' : '-'}{currency}{t.Amount}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
