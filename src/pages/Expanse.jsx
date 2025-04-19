import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Dialog } from 'primereact/dialog';
import { DeleteIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

const Expense = () => {
    const [budgets, setBudgets] = useState([]);
    const [activeBudget, setActiveBudget] = useState(null);
    const [activeBudgetDialog, setActiveBudgetDialog] = useState(false);

    const [category, setCategory] = useState('');
    const [icon, setIcon] = useState('');
    const [total, setTotal] = useState('');
    const [color, setColor] = useState('bg-gray-500');

    const [expenseName, setExpenseName] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [expenseDate, setExpenseDate] = useState("");


    // Fetch budgets
    useEffect(() => {
        fetchBudgets();
    }, []);

    const fetchBudgets = async () => {
        const querySnapshot = await getDocs(collection(db, 'budgets'));
        const loadedBudgets = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        setBudgets(loadedBudgets);
    };

    const handleCreateNewBudget = async () => {
        if (!category.trim()) {
            toast.info("Please enter a category.!");
            return;
        }

        const newBudget = {
            category,
            icon,
            spent: 0,
            total: parseFloat(total),
            color,
        };

        try {
            const budgetsCollectionRef = collection(db, 'budgets');
            await addDoc(budgetsCollectionRef, newBudget);
            fetchBudgets();
            setCategory('');
            setIcon('');
            setTotal(100);
            setColor('bg-gray-500');
            setActiveBudgetDialog(false);
            toast.success('Budget Added Successfully')
        } catch (error) {
            console.error('Error adding budget:', error);
        }
    };

    const handleRemoveBudget = async (id) => {
        try {
            const budgetRef = doc(db, 'budgets', id);
            await deleteDoc(budgetRef);
            setBudgets((prevBudgets) => prevBudgets.filter((budget) => budget.id !== id));
            toast.success('Budget Delete Successfully')
        } catch (error) {
            toast.error('Error removing budget:', error)
        }
    };

    const handleClickBudget = async (budget) => {
        setActiveBudget(budget);
        await fetchExpenses(budget.id);
    };

    const fetchExpenses = async (budgetId) => {
        const expensesSnapshot = await getDocs(collection(db, 'budgets', budgetId, 'expenses'));
        const loadedExpenses = expensesSnapshot.docs.map(doc => doc.data());
        setExpenses(loadedExpenses);
    };

    const handleAddExpense = async () => {
        if (!expenseName.trim() || !expenseAmount) {
            toast.info("Please fill in both fields.");
            return;
        }

        // const newExpense = {
        //     id:,
        //     name: expenseName,
        //     amount: parseFloat(expenseAmount),
        //     date: expenseDate ? expenseDate : new Date().toISOString(),
        // };

        try {
            const expensesRef = collection(db, 'budgets', activeBudget.id, 'expenses');
            const expenseDocRef = await addDoc(expensesRef, {
                name: expenseName,
                amount: parseFloat(expenseAmount),
                date: expenseDate ? expenseDate : new Date().toISOString(),
            });
    
            const newExpense = {
                id: expenseDocRef.id, // Use the auto-generated document ID
                name: expenseName,
                amount: parseFloat(expenseAmount),
                date: expenseDate ? expenseDate : new Date().toISOString(),
            };
    
            // Update the "spent" field in the corresponding budget
            const updatedSpent = activeBudget.spent + newExpense.amount;
            const budgetRef = doc(db, 'budgets', activeBudget.id);
            await updateDoc(budgetRef, { spent: updatedSpent });
            setExpenses(prev => [...prev, newExpense]);
            setActiveBudget(prev => ({ ...prev, spent: updatedSpent }));
            setExpenseName('');
            setExpenseAmount('');
            setExpenseDate('')
            fetchBudgets();
            toast.success('Expense Added Successfully')
        } catch (error) {
            toast.error('Error adding expense:', error);
        }
    };

    const handleDeleteExpense = async (expenseId) => {        
        const confirmDelete = window.confirm("Are you sure you want to delete this expense?"); 
        if(confirmDelete){
            try {
                await deleteDoc(doc(db, "budgets", activeBudget.id, "expenses", expenseId));
                const expensesRef = collection(db, "budgets", activeBudget.id, "expenses");
                const querySnapshot = await getDocs(expensesRef);
                const remainingExpenses = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                const updatedSpent = remainingExpenses.reduce((total, expense) => total + expense.amount, 0);

                // Update the budget's "spent" field in Firestore
                const budgetRef = doc(db, "budgets", activeBudget.id);
                await updateDoc(budgetRef, { spent: updatedSpent });
        
                // Update states to reflect changes
                setExpenses(remainingExpenses); // Update local expenses state
                setActiveBudget((prev) => ({ ...prev, spent: updatedSpent })); 
                setExpenses((prev) => prev.filter((expense) => expense.id !== expenseId));
                toast.success("Expense deleted successfully!");
            } catch (error) {
                console.error("Error deleting expense:", error);
                toast.error("Failed to delete expense. Please try again.");
            }
        } else{
            return
        }      
    };
    
    return (
        <>
            <div className="min-h-screen bg-white p-6">
                <ToastContainer />
                <h1 className="text-2xl font-bold mb-6">My Budgets</h1>
                {!activeBudget ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="w-full max-w-sm mx-auto p-6 bg-blue-100 rounded-lg shadow-md flex flex-col items-center justify-center hover:bg-blue-200 transition-all cursor-pointer" onClick={() => setActiveBudgetDialog(true)}>
                            <PlusIcon className='h-8 w-8 text-gray-700 mb-2' />
                            <span className="text-lg font-semibold text-gray-700">Create New Budget</span>
                        </div>
                        {budgets.map((budget) => (
                            <div key={budget.id} className="p-4 border rounded-lg hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">{budget.icon}</span>
                                    <div className="text-lg font-semibold">{budget.category}</div>
                                    <button onClick={() => handleRemoveBudget(budget.id)} className="ml-auto text-red-500 hover:text-red-700">
                                        <Trash2Icon />
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Spent</p>
                                        <p className="font-bold">₹{budget.spent.toFixed(2)}</p>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                            <div
                                                className={`${budget.color} h-2 rounded-full`}
                                                style={{ width: `${Math.min(100, (budget.spent / budget.total) * 100)}%` }}
                                            ></div>
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
                                    <button
                                        onClick={() => handleClickBudget(budget)}
                                        className="w-full bg-purple-500 text-white p-2 rounded mt-2"
                                    >
                                        View Expenses
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (

                    <div className="max-w-full rounded-3xl mx-auto p-4 bg-purple-100">
                        <button
                            onClick={() => setActiveBudget(null)}
                            className="text-purple-700 hover:text-purple-800 transition-colors duration-300"
                        >
                            Back
                        </button>

                        <div className="flex flex-wrap  justify-center gap-8 mb-6">
                            {/* Budget Box */}
                            <div className="w-full max-w-md h-32 border border-purple-300 rounded-lg p-4 bg-white shadow-md">
                                <div className="flex justify-between items-center mb-4">
                                    <h1 className="text-xl font-bold">{activeBudget.icon} {activeBudget.category}</h1>
                                    <h1 className="text-xl font-bold text-purple-700">{activeBudget.total}</h1>
                                </div>
                                <div className="bg-gray-200 rounded-full h-4">
                                    <div
                                        className="bg-gradient-to-r from-green-500 to-yellow-500 h-4 rounded-full"
                                        style={{ width: `${Math.min(100, (activeBudget.spent / activeBudget.total) * 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-sm mt-2">
                                    <span className="text-green-700">₹{activeBudget.spent.toFixed(2)} spent</span>
                                    <span className="text-red-700">₹{(activeBudget.total - activeBudget.spent).toFixed(2)} remaining</span>
                                </div>
                            </div>

                            {/* Add Expense Box */}
                            <div className="w-full max-w-md h-74 border border-purple-300 rounded-lg bg-purple-50 shadow-lg p-6">
                                <h2 className="font-semibold text-lg mb-4 text-purple-600">Add Expense</h2>
                                <input
                                    type="text"
                                    placeholder="Expense Name"
                                    value={expenseName}
                                    onChange={(e) => setExpenseName(e.target.value)}
                                    className="border border-gray-300 rounded w-full mb-4 p-2 focus:outline-none focus:border-purple-600 hover:border-purple-600 transition-all duration-300"
                                />
                                <input
                                    type="number"
                                    placeholder="Amount"
                                    value={expenseAmount}
                                    onChange={(e) => setExpenseAmount(e.target.value)}
                                    className="border border-gray-300 rounded w-full mb-4 p-2 focus:outline-none focus:border-purple-600 hover:border-purple-600 transition-all duration-300"
                                />
                                <input
                                    type="date"
                                    value={expenseDate}
                                    onChange={(e) => setExpenseDate(e.target.value)}
                                    className="border border-gray-300 rounded w-full mb-4 p-2 focus:outline-none focus:border-purple-600 hover:border-purple-600 transition-all duration-300"
                                />
                                <button
                                    onClick={handleAddExpense}
                                    className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 transition-colors duration-300"
                                >
                                    Add Expense
                                </button>
                            </div>
                        </div>


                        <div>
                            <h2 className="font-semibold mb-4">Expenses</h2>
                            {expenses.length === 0 ? (
                                <p className="text-gray-500">No expenses added yet.</p>
                            ) : (
                                <table className="w-full border-collapse border border-gray-300 bg-white rounded-lg shadow-md">
                                    <thead className="bg-purple-500 text-white">
                                        <tr>
                                            <th className="border border-gray-300 p-2 text-left">Date</th>
                                            <th className="border border-gray-300 p-2 text-left">Name</th>
                                            <th className="border border-gray-300 p-2 text-left">Amount</th>
                                            <th className="border border-gray-300 p-2 text-left">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expenses.map((expense, index) => (
                                            
                                            <tr key={index} className="hover:bg-gray-100 transition-colors duration-300">
                                                <td className="border border-gray-300 p-2">
                                                    {new Intl.DateTimeFormat("en-GB", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                    }).format(new Date(expense.date))}
                                                </td>
                                                <td className="border border-gray-300 p-2">{expense.name}</td>
                                                <td className="border border-gray-300 p-2">₹{expense.amount.toFixed(2)}</td>
                                                <td className="border border-gray-300 p-2">
                                                    {/* Delete Icon */}
                                                    <button
                                                        onClick={() => handleDeleteExpense(expense.id)}
                                                        className="text-red-500 hover:text-red-700 transition-colors duration-300"
                                                    >
                                                        <Trash2Icon/>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                    </div>

                )}
            </div>

            <Dialog header="Add Budget" modal visible={activeBudgetDialog} style={{ width: '50vw' }} onHide={() => setActiveBudgetDialog(false)}>
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="border p-2 rounded w-full"
                    />
                    <input
                        type="text"
                        placeholder="Icon (e.g. 🛍️)"
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        className="border p-2 rounded w-full"
                    />
                    <input type="number" placeholder="Total Amount" value={total} onChange={(e) => setTotal(e.target.value)} className="border p-2 rounded w-full" />
                    <select
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="border p-2 rounded w-full"
                    >
                        <option value="bg-blue-500">Blue</option>
                        <option value="bg-green-500">Green</option>
                        <option value="bg-yellow-500">Yellow</option>
                        <option value="bg-purple-500">Purple</option>
                        <option value="bg-red-500">Red</option>
                    </select>
                    <button
                        onClick={handleCreateNewBudget}
                        className="bg-blue-500 text-white p-2 rounded w-full"
                    >
                        Add Budget
                    </button>
                </div>
            </Dialog>
        </>
    );
};

export default Expense;
