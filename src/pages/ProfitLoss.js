import React, { useState, useEffect } from 'react';
import { Container, Accordion, Spinner } from 'react-bootstrap';

export default function ProfitLoss() {
    const [income, setIncome] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [sources, setSources] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true); // Loading state

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Start loading
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.error("User token not available");
                    setError("User token not available");
                    setLoading(false); // Stop loading
                    return;
                }

                // Fetch income
                const incomeResponse = await fetch(
                    `${process.env.REACT_APP_API_BASE_URL}/incomes`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!incomeResponse.ok) {
                    throw new Error(`HTTP error! Status: ${incomeResponse.status}`);
                }

                const incomeData = await incomeResponse.json();
                if (Array.isArray(incomeData)) {
                    incomeData.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setIncome(incomeData);
                } else {
                    console.error("Unexpected income data format");
                    setError("Unexpected income data format");
                }

                // Fetch expenses
                const expenseResponse = await fetch(
                    `${process.env.REACT_APP_API_BASE_URL}/expenses`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!expenseResponse.ok) {
                    throw new Error(`HTTP error! Status: ${expenseResponse.status}`);
                }

                const expenseData = await expenseResponse.json();
                if (Array.isArray(expenseData)) {
                    expenseData.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setExpenses(expenseData);
                } else {
                    console.error("Unexpected expense data format");
                    setError("Unexpected expense data format");
                }

                // Fetch sources
                const sourceResponse = await fetch(
                    `${process.env.REACT_APP_API_BASE_URL}/sources`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!sourceResponse.ok) {
                    throw new Error(`HTTP error! Status: ${sourceResponse.status}`);
                }

                const sourceData = await sourceResponse.json();
                if (Array.isArray(sourceData)) {
                    setSources(sourceData);
                } else {
                    console.error("Unexpected source data format");
                    setError("Unexpected source data format");
                }

            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Error fetching data");
            } finally {
                setLoading(false); // Stop loading
            }
        };

        fetchData();
    }, []);

    const getSourceNameById = (sourceId) => {
        const source = sources.find(source => source._id === sourceId);
        return source ? source.sourceName : 'Unknown';
    };

    const groupByMonthAndDay = (data, type) => {
        return data.reduce((months, record) => {
            const date = new Date(record.date);
            const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
            const day = date.toLocaleDateString();

            if (!months[monthYear]) {
                months[monthYear] = {};
            }

            if (!months[monthYear][day]) {
                months[monthYear][day] = { totalIncome: 0, totalExpenses: 0, incomeRecords: [], expenseRecords: [] };
            }

            if (type === 'income') {
                months[monthYear][day].totalIncome += record.incomeAmount;
                months[monthYear][day].incomeRecords.push(record);
            } else {
                months[monthYear][day].totalExpenses += record.expenseAmount;
                months[monthYear][day].expenseRecords.push(record);
            }

            return months;
        }, {});
    };

    const groupedIncome = groupByMonthAndDay(income, 'income');
    const groupedExpenses = groupByMonthAndDay(expenses, 'expense');

    // Calculate profit/loss
    const calculateProfitLoss = (monthYear) => {
        const totalIncome = Object.values(groupedIncome[monthYear] || {}).reduce((total, day) => total + day.totalIncome, 0);
        const totalExpenses = Object.values(groupedExpenses[monthYear] || {}).reduce((total, day) => total + day.totalExpenses, 0);
        return totalIncome - totalExpenses;
    };

    return (
        <Container className="mt-5">
            <h1>Profit and Loss:</h1>
            {loading ? (
                <Spinner animation="border" />
            ) : error ? (
                <p>{error}</p>
            ) : Object.keys(groupedIncome).length === 0 && Object.keys(groupedExpenses).length === 0 ? (
                <p>No data found.</p>
            ) : (
                <Accordion>
                    {Array.from(new Set([...Object.keys(groupedIncome), ...Object.keys(groupedExpenses)])).map((monthYear, index) => {
                        const profitLoss = calculateProfitLoss(monthYear);
                        const isPositive = profitLoss >= 0;

                        // Calculate totals for the month-year section
                        const totalIncome = Object.values(groupedIncome[monthYear] || {}).reduce((total, day) => total + day.totalIncome, 0);
                        const totalExpenses = Object.values(groupedExpenses[monthYear] || {}).reduce((total, day) => total + day.totalExpenses, 0);

                        return (
                            <Accordion.Item key={monthYear} eventKey={`${index}`}>
                                <Accordion.Header>
                                    <div className="d-flex justify-content-between align-items-center w-100">
                                        <div className="flex-grow-1">
                                            <h4>{monthYear}</h4>
                                        </div>
                                        <div className="d-flex flex-column align-items-end">
                                            <span className="fw-bold" style={{ color: isPositive ? 'green' : 'red' }}>
                                                Profit/Loss: ₱{profitLoss.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <Accordion>
                                        <Accordion.Item eventKey="income">
                                            <Accordion.Header>
                                                <div className="flex-grow-1">
                                                    <h5>Income</h5>
                                                </div>
                                                <div className="d-flex flex-column align-items-end">
                                                    <span>Total Income: ₱{totalIncome.toFixed(2)}</span>
                                                </div>
                                            </Accordion.Header>
                                            <Accordion.Body>
                                                <Accordion>
                                                    {Object.keys(groupedIncome[monthYear] || {}).map((date, subIndex) => (
                                                        <Accordion.Item key={`income-${date}`} eventKey={`${index}-${subIndex}`}>
                                                            <Accordion.Header>
                                                                <div className="w-100 d-flex justify-content-between align-items-center">
                                                                    <h6>{date}</h6>
                                                                    <span>Total Income: ₱{groupedIncome[monthYear][date].totalIncome.toFixed(2)}</span>
                                                                </div>
                                                            </Accordion.Header>
                                                            <Accordion.Body>
                                                                <Accordion>
                                                                    {groupedIncome[monthYear][date].incomeRecords.map(income => (
                                                                        <Accordion.Item key={income._id} eventKey={`income-${income._id}`}>
                                                                            <Accordion.Header>
                                                                                <div className="w-100 d-flex justify-content-between align-items-center">
                                                                                    <h6>{income.incomeName}</h6>
                                                                                    <span>₱{income.incomeAmount.toFixed(2)}</span>
                                                                                </div>
                                                                            </Accordion.Header>
                                                                            <Accordion.Body>
                                                                                <div>
                                                                                    <p><strong>Description:</strong> {income.incomeDescription}</p>
                                                                                    <p><strong>Source:</strong> {getSourceNameById(income.sourceId)}</p>
                                                                                </div>
                                                                            </Accordion.Body>
                                                                        </Accordion.Item>
                                                                    ))}
                                                                </Accordion>
                                                            </Accordion.Body>
                                                        </Accordion.Item>
                                                    ))}
                                                </Accordion>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        <Accordion.Item eventKey="expenses">
                                            <Accordion.Header>
                                                <div className="flex-grow-1">
                                                    <h5>Expenses</h5>
                                                </div>
                                                <div className="d-flex flex-column align-items-end">
                                                    <span>Total Expenses: ₱{totalExpenses.toFixed(2)}</span>
                                                </div>
                                                
                                            </Accordion.Header>
                                            <Accordion.Body>
                                                <Accordion>
                                                    {Object.keys(groupedExpenses[monthYear] || {}).map((date, subIndex) => (
                                                        <Accordion.Item key={`expense-${date}`} eventKey={`${index}-${subIndex}`}>
                                                            <Accordion.Header>
                                                                <div className="w-100 d-flex justify-content-between align-items-center">
                                                                    <h6>{date}</h6>
                                                                    <span>Total Expenses: ₱{groupedExpenses[monthYear][date].totalExpenses.toFixed(2)}</span>
                                                                </div>
                                                            </Accordion.Header>
                                                            <Accordion.Body>
                                                                <Accordion>
                                                                    {groupedExpenses[monthYear][date].expenseRecords.map(expense => (
                                                                        <Accordion.Item key={expense._id} eventKey={`expense-${expense._id}`}>
                                                                            <Accordion.Header>
                                                                                <div className="w-100 d-flex justify-content-between align-items-center">
                                                                                    <h6>{expense.expenseName}</h6>
                                                                                    <span>₱{expense.expenseAmount.toFixed(2)}</span>
                                                                                </div>
                                                                            </Accordion.Header>
                                                                            <Accordion.Body>
                                                                                <div>
                                                                                    <p><strong>Description:</strong> {expense.expenseDescription}</p>
                                                                                    <p><strong>Source:</strong> {getSourceNameById(expense.sourceId)}</p>
                                                                                </div>
                                                                            </Accordion.Body>
                                                                        </Accordion.Item>
                                                                    ))}
                                                                </Accordion>
                                                            </Accordion.Body>
                                                        </Accordion.Item>
                                                    ))}
                                                </Accordion>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    </Accordion>
                                </Accordion.Body>
                            </Accordion.Item>
                        );
                    })}
                </Accordion>
            )}
        </Container>
    );
}
