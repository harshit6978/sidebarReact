import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc, query, where } from 'firebase/firestore';
import { Dialog } from 'primereact/dialog';
import { DeleteIcon, PlusIcon, Trash2Icon, PencilIcon } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { getAuth } from 'firebase/auth';

const Expense = () => {
    const [budgets, setBudgets] = useState([]);
    const [activeBudget, setActiveBudget] = useState(null);
    const [activeBudgetDialog, setActiveBudgetDialog] = useState(false);
    const [editBudgetDialog, setEditBudgetDialog] = useState(false);
    const [editExpenseDialog, setEditExpenseDialog] = useState(false);

    const [category, setCategory] = useState('');
    const [icon, setIcon] = useState('');
    const [total, setTotal] = useState(100);
    const [color, setColor] = useState('bg-gray-500');
    const [expenseName, setExpenseName] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseDate, setExpenseDate] = useState('');
    const [expenses, setExpenses] = useState([]);

    const [editingBudget, setEditingBudget] = useState(null);
    const [editingExpense, setEditingExpense] = useState(null);

    const auth = getAuth();

    useEffect(() => {
        fetchBudgets();
    }, []);

    const fetchBudgets = async () => {
        try {
            const q = query(collection(db, 'budgets'), where("userId", "==", auth.currentUser.uid));
            const querySnapshot = await getDocs(q);
            const loadedBudgets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setBudgets(loadedBudgets);
        } catch (error) {
            toast.error('Error fetching budgets');
        }
    };

    const handleCreateNewBudget = async () => {
        if (!category.trim()) return toast.info("Please enter a category.");

        const newBudget = {
            category, icon, spent: 0, total: parseFloat(total),
            color, userId: auth.currentUser.uid,
        };

        try {
            await addDoc(collection(db, 'budgets'), newBudget);
            fetchBudgets();
            setCategory(''); setIcon(''); setTotal(100); setColor('bg-gray-500');
            setActiveBudgetDialog(false);
            toast.success('Budget Added Successfully');
        } catch (error) {
            toast.error('Error adding budget');
        }
    };

    const handleRemoveBudget = async (id) => {
        const confirm = window.confirm("Are you sure to delete this budget?");
        if (!confirm) return;
        try {
            const budgetRef = doc(db, 'budgets', id);
            const budgetSnap = await getDoc(budgetRef);
            if (budgetSnap.exists() && budgetSnap.data().userId === auth.currentUser.uid) {
                await deleteDoc(budgetRef);
                setBudgets(prev => prev.filter(b => b.id !== id));
                toast.success('Budget Deleted');
            }
        } catch (error) {
            toast.error('Error deleting budget');
        }
    };

    const handleClickBudget = async (budget) => {
        setActiveBudget(budget);
        await fetchExpenses(budget.id);
    };

    const fetchExpenses = async (budgetId) => {
        try {
            const q = query(collection(db, 'budgets', budgetId, 'expenses'), where("userId", "==", auth.currentUser.uid));
            const snapshot = await getDocs(q);
            const loadedExpenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setExpenses(loadedExpenses);
        } catch (error) {
            toast.error('Error fetching expenses');
        }
    };

    const handleAddExpense = async () => {
        if (!expenseName.trim() || !expenseAmount) return toast.info("Please fill in both fields.");

        try {
            const expensesRef = collection(db, 'budgets', activeBudget.id, 'expenses');
            const expenseDoc = await addDoc(expensesRef, {
                name: expenseName,
                amount: parseFloat(expenseAmount),
                date: expenseDate ? expenseDate : new Date().toISOString(),
                userId: auth.currentUser.uid,
            });

            const newExpense = {
                id: expenseDoc.id, name: expenseName, amount: parseFloat(expenseAmount),
                date: expenseDate ? expenseDate : new Date().toISOString(),
            };

            const updatedSpent = activeBudget.spent + newExpense.amount;
            await updateDoc(doc(db, 'budgets', activeBudget.id), { spent: updatedSpent });

            setExpenses(prev => [...prev, newExpense]);
            setActiveBudget(prev => ({ ...prev, spent: updatedSpent }));

            setExpenseName(''); setExpenseAmount(''); setExpenseDate('');
            fetchBudgets();
            toast.success('Expense Added');
        } catch (error) {
            toast.error('Error adding expense');
        }
    };

    const handleDeleteExpense = async (expenseId) => {
        const confirmDelete = window.confirm("Are you sure?");
        if (!confirmDelete) return;

        try {
            const expenseRef = doc(db, "budgets", activeBudget.id, "expenses", expenseId);
            const expenseSnap = await getDoc(expenseRef);

            if (expenseSnap.exists() && expenseSnap.data().userId === auth.currentUser.uid) {
                await deleteDoc(expenseRef);

                const q = query(collection(db, "budgets", activeBudget.id, "expenses"),
                    where("userId", "==", auth.currentUser.uid));
                const snapshot = await getDocs(q);
                const remaining = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const updatedSpent = remaining.reduce((total, e) => total + e.amount, 0);
                await updateDoc(doc(db, "budgets", activeBudget.id), { spent: updatedSpent });

                setExpenses(remaining);
                setActiveBudget(prev => ({ ...prev, spent: updatedSpent }));
                toast.success("Expense deleted!");
            }
        } catch (error) {
            toast.error("Error deleting expense");
        }
    };

    const handleEditBudget = (budget) => {
        setEditingBudget(budget);
        setEditBudgetDialog(true);
        setCategory(budget.category);
        setIcon(budget.icon);
        setTotal(budget.total);
        setColor(budget.color);
    };

    const handleUpdateBudget = async () => {
        try {
            await updateDoc(doc(db, 'budgets', editingBudget.id), {
                category, icon, total: parseFloat(total), color
            });
            setEditBudgetDialog(false);
            setEditingBudget(null);
            fetchBudgets();
            toast.success('Budget updated!');
        } catch (error) {
            toast.error('Error updating budget');
        }
    };

    const handleEditExpense = (expense) => {
        setEditingExpense(expense);
        setExpenseName(expense.name);
        setExpenseAmount(expense.amount);
        setExpenseDate(expense.date.substring(0, 10));
        setEditExpenseDialog(true);
    };

    const handleUpdateExpense = async () => {
        try {
            const expenseRef = doc(db, 'budgets', activeBudget.id, 'expenses', editingExpense.id);
            await updateDoc(expenseRef, {
                name: expenseName,
                amount: parseFloat(expenseAmount),
                date: expenseDate,
            });
            fetchExpenses(activeBudget.id);
            fetchBudgets();
            setEditExpenseDialog(false);
            toast.success('Expense updated!');
        } catch (error) {
            toast.error('Error updating expense');
        }
    };

    return (
        <div className="min-h-screen bg-white p-6">
            <ToastContainer />
            <h1 className="text-2xl font-bold mb-6">My Budgets</h1>

            {!activeBudget ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="w-full max-w-sm mx-auto p-6 bg-blue-100 rounded-lg shadow-md flex flex-col items-center justify-center hover:bg-blue-200 transition-all cursor-pointer"
                        onClick={() => setActiveBudgetDialog(true)}>
                        <PlusIcon className='h-8 w-8 text-gray-700 mb-2' />
                        <span className="text-lg font-semibold text-gray-700">Create New Budget</span>
                    </div>
                    {budgets.map((budget) => (
                        <div key={budget.id} className="p-4 border rounded-lg hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">{budget.icon}</span>
                                <div className="text-lg font-semibold">{budget.category}</div>
                                <button onClick={() => handleRemoveBudget(budget.id)} className="ml-auto text-red-500">
                                    <Trash2Icon />
                                </button>
                                <button onClick={() => handleEditBudget(budget)} className="text-purple-600">
                                    <PencilIcon />
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Spent</p>
                                    <p className="font-bold">₹{budget.spent.toFixed(2)}</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                        <div className={`${budget.color} h-2 rounded-full`}
                                            style={{ width: `${Math.min(100, (budget.spent / budget.total) * 100)}%` }} />
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Remaining</p>
                                        <p className="font-bold">₹{(budget.total - budget.spent).toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total</p>
                                        <p className="font-bold">₹{budget.total.toFixed(2)}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleClickBudget(budget)}
                                    className="w-full bg-purple-500 text-white p-2 rounded mt-2">
                                    View Expenses
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="max-w-full rounded-3xl mx-auto p-4 bg-purple-100">
                    <button onClick={() => setActiveBudget(null)} className="text-purple-700">Back</button>
                    <div className="flex flex-wrap gap-8 mb-6">
                        <div className="w-full max-w-md h-32 border border-purple-300 rounded-lg p-4 bg-white shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h1 className="text-xl font-bold">{activeBudget.icon} {activeBudget.category}</h1>
                                <h1 className="text-xl font-bold text-purple-700">{activeBudget.total}</h1>
                            </div>
                            <div className="bg-gray-200 rounded-full h-4">
                                <div className="bg-gradient-to-r from-green-500 to-yellow-500 h-4 rounded-full"
                                    style={{ width: `${Math.min(100, (activeBudget.spent / activeBudget.total) * 100)}%` }} />
                            </div>
                            <div className="flex justify-between text-sm mt-2">
                                <span className="text-green-700">₹{activeBudget.spent.toFixed(2)} spent</span>
                                <span className="text-red-700">₹{(activeBudget.total - activeBudget.spent).toFixed(2)} remaining</span>
                            </div>
                        </div>

                        <div className="w-full max-w-md h-74 border border-purple-300 rounded-lg bg-purple-50 shadow-lg p-6">
                            <h2 className="font-semibold text-lg mb-4 text-purple-600">Add Expense</h2>
                            <input type="text" placeholder="Expense Name" value={expenseName}
                                onChange={(e) => setExpenseName(e.target.value)} className="border rounded w-full mb-4 p-2" />
                            <input type="number" placeholder="Amount" value={expenseAmount}
                                onChange={(e) => setExpenseAmount(e.target.value)} className="border rounded w-full mb-4 p-2" />
                            <input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)}
                                className="border rounded w-full mb-4 p-2" />
                            <button onClick={handleAddExpense}
                                className="w-full bg-purple-500 text-white py-2 rounded">Add Expense</button>
                        </div>
                    </div>

                    <h2 className="font-semibold mb-4">Expenses</h2>
                    {expenses.length === 0 ? (
                        <p className="text-gray-500">No expenses added yet.</p>
                    ) : (
                        <table className="w-full border bg-white rounded-lg shadow-md">
                            <thead className="bg-purple-500 text-white">
                                <tr>
                                            <th className="border border-gray-300 p-2 text-left">Date</th>
                                            <th className="border border-gray-300 p-2 text-left">Name</th>
                                            <th className="border border-gray-300 p-2 text-left">Amount</th>
                                            <th className="border border-gray-300 p-2 text-left">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map(exp => (
                                    <tr key={exp.id} className="hover:bg-gray-100">
                                        <td className="border border-gray-300 p-2">{new Date(exp.date).toLocaleDateString()}</td>
                                        <td className="border border-gray-300 p-2">{exp.name}</td>
                                                <td className="border border-gray-300 p-2">₹{exp.amount.toFixed(2)}</td>
                                        <td>
                                            <button onClick={() => handleEditExpense(exp)} className="text-purple-600 mr-2">
                                                <PencilIcon size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteExpense(exp.id)} className="text-red-500">
                                                <Trash2Icon size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Add/Edit Budget Dialog */}
            <Dialog header="Budget Details" visible={activeBudgetDialog || editBudgetDialog} style={{ width: '400px' }}
                onHide={() => { setActiveBudgetDialog(false); setEditBudgetDialog(false) }}>
                <div className="space-y-4">
                    <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)}
                        className="border p-2 rounded w-full" />
                    <input type="text" placeholder="Icon" value={icon} onChange={(e) => setIcon(e.target.value)}
                        className="border p-2 rounded w-full" />
                    <input type="number" placeholder="Total Amount" value={total}
                        onChange={(e) => setTotal(e.target.value)} className="border p-2 rounded w-full" />
                    <select value={color} onChange={(e) => setColor(e.target.value)} className="border p-2 rounded w-full">
                        <option value="bg-blue-500">Blue</option>
                        <option value="bg-green-500">Green</option>
                        <option value="bg-yellow-500">Yellow</option>
                        <option value="bg-purple-500">Purple</option>
                        <option value="bg-red-500">Red</option>
                    </select>
                    <button onClick={editBudgetDialog ? handleUpdateBudget : handleCreateNewBudget}
                        className="bg-purple-500 text-white p-2 rounded w-full">
                        {editBudgetDialog ? 'Update Budget' : 'Add Budget'}
                    </button>
                </div>
            </Dialog>

            {/* Edit Expense Dialog */}
            <Dialog header="Edit Expense"  modal visible={editExpenseDialog} style={{ width: '400px' }}
                onHide={() => setEditExpenseDialog(false)}>
                <div className="space-y-4">
                    <input type="text" placeholder="Name" value={expenseName} onChange={(e) => setExpenseName(e.target.value)}
                        className="border p-2 rounded w-full" />
                    <input type="number" placeholder="Amount" value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)} className="border p-2 rounded w-full" />
                    <input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)}
                        className="border p-2 rounded w-full" />
                    <button onClick={handleUpdateExpense} className="bg-purple-500 text-white p-2 rounded w-full">
                        Update Expense
                    </button>
                </div>
            </Dialog>
        </div>
    );
};

export default Expense;
