import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // Firebase Firestore instance
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Chart } from "primereact/chart";
import { Card } from "primereact/card";
import { FileTextIcon, HomeIcon, ShoppingCartIcon } from "lucide-react";

const Dashboard = () => {
  const [budgets, setBudgets] = useState([]);
  const auth = getAuth();

  // Fetch user-specific budgets
  useEffect(() => {
    const fetchBudgets = async () => {
      const user = auth.currentUser; // Get the logged-in user
      if (!user) {
        console.error("No user logged in.");
        return;
      }

      try {
        const budgetsCollectionRef = collection(db, "budgets");
        const q = query(budgetsCollectionRef, where("userId", "==", user.uid)); // Filter budgets by user ID
        const querySnapshot = await getDocs(q);
        const loadedBudgets = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBudgets(loadedBudgets);
      } catch (error) {
        console.error("Error fetching budgets:", error);
      }
    };

    fetchBudgets();
  }, []);

  // Calculate statistics
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.total, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const remainingAmount = totalBudget - totalSpent;
  const numberOfBudgets = budgets.length;

  const chartData = {
    labels: budgets.map((budget) => budget.category),
    datasets: [
      {
        label: "Spent Amount",
        backgroundColor: "#3f0d82", // Dark purple
        data: budgets.map((budget) => budget.spent),
      },
      {
        label: "Remaining Amount",
        backgroundColor: "#b29cd6", // Light purple
        data: budgets.map((budget) => budget.total - budget.spent),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "Activity Overview",
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          font: {
            weight: 500,
          },
        },
        grid: {
          display: false, // Removes gridlines on the x-axis
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          display: false, // Removes gridlines on the y-axis
        },
      },
    },
    elements: {
      bar: {
        barThickness: 10,
        maxBarThickness: 15,
      },
    },
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Budget Summary Section */}
      <div className="flex justify-between mb-6">
        {/* Total Budget Card */}
        <Card className="flex-1 mx-2 bg-blue-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105">
          <div className="flex flex-row items-center justify-between pb-2">
            <h1 className="text-sm font-medium text-blue-600">Total Budget</h1>
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
              <HomeIcon className="h-4 w-4 text-white" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-800">₹{totalBudget}</div>
          </div>
        </Card>

        {/* Total Spend Card */}
        <Card className="flex-1 mx-2 bg-green-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105">
          <div className="flex flex-row items-center justify-between pb-2">
            <h1 className="text-sm font-medium text-green-600">Total Spend</h1>
            <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
              <ShoppingCartIcon className="h-4 w-4 text-white" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-800">₹{totalSpent}</div>
          </div>
        </Card>

        {/* Remaining Amount Card */}
        <Card className="flex-1 mx-2 bg-red-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105">
          <div className="flex flex-row items-center justify-between pb-2">
            <h1 className="text-sm font-medium text-red-600">Remaining Amount</h1>
            <div className="h-8 w-8 bg-red-600 rounded-full flex items-center justify-center">
              <HomeIcon className="h-4 w-4 text-white" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-800">₹{remainingAmount}</div>
          </div>
        </Card>

        {/* Number of Budgets Card */}
        <Card className="flex-1 mx-2 bg-yellow-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105">
          <div className="flex flex-row items-center justify-between pb-2">
            <h1 className="text-sm font-medium text-yellow-600">No. Of Budgets</h1>
            <div className="h-8 w-8 bg-yellow-600 rounded-full flex items-center justify-center">
              <FileTextIcon className="h-4 w-4 text-white" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-800">{numberOfBudgets}</div>
          </div>
        </Card>
      </div>

      {/* Chart Section */}
    <Card className="w-[calc(50%-16px)]  mb-8"> {/* Chart width equal to two cards */}
        <div>
          <h3 className="text-lg font-semibold">Activity</h3>
        </div>
        <div className="h-[400px] border border-gray-400 rounded-lg p-4">
          <Chart type="bar" data={chartData} options={chartOptions} />
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
