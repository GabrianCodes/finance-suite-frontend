import React, { useState, useEffect } from 'react';
import { Container, Card, ListGroup, Accordion, Button, Modal, Form } from 'react-bootstrap';

export default function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [sources, setSources] = useState([]);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [newExpense, setNewExpense] = useState({
        expenseName: '',
        sourceId: '',
        expenseDescription: '',
        expenseAmount: '',
        date: new Date().toISOString().slice(0, 10),
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.error("User token not available");
                    setError("User token not available");
                    return;
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
            }
        };

        fetchData();
    }, []);

    const getSourceNameById = (sourceId) => {
        const source = sources.find(source => source._id === sourceId);
        return source ? source.sourceName : 'Unknown';
    };

    const groupByMonth = (expenses) => {
        return expenses.reduce((months, expense) => {
            const date = new Date(expense.date);
            const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
            if (!months[monthYear]) {
                months[monthYear] = {};
            }

            if (!months[monthYear][date.toLocaleDateString()]) {
                months[monthYear][date.toLocaleDateString()] = { totalAmount: 0, expenses: [] };
            }

            months[monthYear][date.toLocaleDateString()].totalAmount += expense.expenseAmount;
            months[monthYear][date.toLocaleDateString()].expenses.push(expense);

            return months;
        }, {});
    };

    const groupedExpenses = groupByMonth(expenses);

    const handleModalClose = () => {
        setShowAddModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
        setSelectedExpense(null);
        setNewExpense({
            expenseName: '',
            sourceId: '',
            expenseDescription: '',
            expenseAmount: '',
            date: new Date().toISOString().slice(0, 10),
        });
    };

    const handleAddModalShow = () => setShowAddModal(true);

    const handleEditModalShow = (expense) => {
        setSelectedExpense(expense);
        setNewExpense({
            expenseName: expense.expenseName,
            sourceId: expense.sourceId,
            expenseDescription: expense.expenseDescription,
            expenseAmount: expense.expenseAmount,
            date: expense.date.slice(0, 10),
        });
        setShowEditModal(true);
    };

    const handleDeleteModalShow = (expense) => {
        setSelectedExpense(expense);
        setShowDeleteModal(true);
    };

    const handleChange = (e) => {
        setNewExpense({
            ...newExpense,
            [e.target.name]: e.target.value,
        });
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("User token not available");
                setError("User token not available");
                return;
            }

            const response = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/expenses`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(newExpense),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const expenseData = await response.json();
            setExpenses([expenseData, ...expenses]); // Add new expense to the top of the list
            handleModalClose();
        } catch (error) {
            console.error("Error adding expense:", error);
            setError("Error adding expense");
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("User token not available");
                setError("User token not available");
                return;
            }

            const response = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/expenses/${selectedExpense._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(newExpense),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const updatedExpense = await response.json();
            setExpenses(expenses.map(expense =>
                expense._id === updatedExpense._id ? updatedExpense : expense
            ));
            handleModalClose();
        } catch (error) {
            console.error("Error updating expense:", error);
            setError("Error updating expense");
        }
    };

    const handleDeleteSubmit = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("User token not available");
                setError("User token not available");
                return;
            }

            const response = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/expenses/${selectedExpense._id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            setExpenses(expenses.filter(expense => expense._id !== selectedExpense._id));
            handleModalClose();
        } catch (error) {
            console.error("Error deleting expense:", error);
            setError("Error deleting expense");
        }
    };

    return (
        <Container className="mt-5">
            <h1>Your Expenses:</h1>
            <Button variant="primary" onClick={handleAddModalShow} className="mb-3">
                Add Expense
            </Button>
            {error ? (
                <p>{error}</p>
            ) : Object.keys(groupedExpenses).length === 0 ? (
                <p>No expenses found.</p>
            ) : (
                <Accordion defaultActiveKey="0">
                    {Object.keys(groupedExpenses).map((monthYear, index) => (
                        <Accordion.Item key={monthYear} eventKey={`${index}`}>
                            <Accordion.Header>
                                <div className="w-100 d-flex justify-content-between align-items-center">
                                    <h4>{monthYear}</h4>
                                    <span>Total: ₱{
                                        Object.values(groupedExpenses[monthYear]).reduce(
                                            (total, day) => total + day.totalAmount, 0
                                        ).toFixed(2)
                                    }</span>
                                </div>
                            </Accordion.Header>
                            <Accordion.Body>
                                <Accordion>
                                    {Object.keys(groupedExpenses[monthYear]).map((date, subIndex) => (
                                        <Accordion.Item key={date} eventKey={`${index}-${subIndex}`}>
                                            <Accordion.Header>
                                                <div className="w-100 d-flex justify-content-between align-items-center">
                                                    <Card.Title>{date}</Card.Title>
                                                    <Card.Subtitle>Total: ₱{
                                                        groupedExpenses[monthYear][date].totalAmount.toFixed(2)
                                                    }</Card.Subtitle>
                                                </div>
                                            </Accordion.Header>
                                            <Accordion.Body>
                                                <Accordion>
                                                    {groupedExpenses[monthYear][date].expenses.map(expense => (
                                                        <Accordion.Item key={expense._id} eventKey={expense._id}>
                                                            <Accordion.Header>
                                                                <div className="w-100 d-flex justify-content-between align-items-center">
                                                                    <span>{expense.expenseName}</span>
                                                                    <span>₱{expense.expenseAmount}</span>
                                                                </div>
                                                            </Accordion.Header>
                                                            <Accordion.Body>
                                                                <Card.Text>Description: {expense.expenseDescription}</Card.Text>
                                                                <Card.Text>Source: {getSourceNameById(expense.sourceId)}</Card.Text>
                                                                <div className="mt-3">
                                                                    <Button variant="warning" onClick={() => handleEditModalShow(expense)} className="me-2">
                                                                        Edit
                                                                    </Button>
                                                                    <Button variant="danger" onClick={() => handleDeleteModalShow(expense)}>
                                                                        Delete
                                                                    </Button>
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
                    ))}
                </Accordion>
            )}

            {/* Add Expense Modal */}
            <Modal show={showAddModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Expense</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Expense Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="expenseName"
                                value={newExpense.expenseName}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Source</Form.Label>
                            <Form.Select
                                name="sourceId"
                                value={newExpense.sourceId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select a source</option>
                                {sources.map(source => (
                                    <option key={source._id} value={source._id}>
                                        {source.sourceName}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="expenseDescription"
                                value={newExpense.expenseDescription}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Amount</Form.Label>
                            <Form.Control
                                type="number"
                                name="expenseAmount"
                                value={newExpense.expenseAmount}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="date"
                                value={newExpense.date}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Add Expense
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Edit Expense Modal */}
            <Modal show={showEditModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Expense</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleEditSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Expense Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="expenseName"
                                value={newExpense.expenseName}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Source</Form.Label>
                            <Form.Select
                                name="sourceId"
                                value={newExpense.sourceId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select a source</option>
                                {sources.map(source => (
                                    <option key={source._id} value={source._id}>
                                        {source.sourceName}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="expenseDescription"
                                value={newExpense.expenseDescription}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Amount</Form.Label>
                            <Form.Control
                                type="number"
                                name="expenseAmount"
                                value={newExpense.expenseAmount}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="date"
                                value={newExpense.date}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Update Expense
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Delete Expense Modal */}
            <Modal show={showDeleteModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Expense</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this expense?
                    <div className="mt-3">
                        <Button variant="danger" onClick={handleDeleteSubmit}>
                            Delete
                        </Button>
                        <Button variant="secondary" onClick={handleModalClose} className="ms-2">
                            Cancel
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </Container>
    );
}
