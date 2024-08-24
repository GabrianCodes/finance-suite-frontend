import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale } from 'chart.js';
import UserContext from '../UserContext'

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale);

const Dashboard = () => {
  const [data, setData] = useState({
    incomes: [],
    expenses: [],
    profitLoss: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;

        const response = await axios.get(`/data/daily/${year}/${month}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        setData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processDataForChart = (data) => {
    const labels = [];
    const incomeData = [];
    const expenseData = [];
    const profitLossData = [];

    data.incomes.forEach(income => {
      labels.push(income._id.day);
      incomeData.push(income.totalIncome);
    });

    data.expenses.forEach(expense => {
      if (!labels.includes(expense._id.day)) {
        labels.push(expense._id.day);
      }
      expenseData.push(expense.totalExpenses);
    });

    data.profitLoss.forEach(profit => {
      profitLossData.push(profit.profitLoss);
    });

    return { labels, incomeData, expenseData, profitLossData };
  };

  const { labels, incomeData, expenseData, profitLossData } = processDataForChart(data);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: incomeData,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true
      },
      {
        label: 'Expenses',
        data: expenseData,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true
      },
      {
        label: 'Profit/Loss',
        data: profitLossData,
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: true
      }
    ]
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading data: {error.message}</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
    </div>
  );
};

export default Dashboard;