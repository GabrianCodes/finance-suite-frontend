import React, { useState, useEffect } from 'react';
import { Container, Card, ListGroup, Accordion, Button, Modal, Form, Spinner } from 'react-bootstrap';

export default function Income() {
    const [income, setIncome] = useState([]);
    const [sources, setSources] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true); // Loading state
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedIncome, setSelectedIncome] = useState(null);
    const [newIncome, setNewIncome] = useState({
        incomeName: '',
        sourceId: '', // Source ID
        incomeDescription: '',
        incomeAmount: '',
        date: new Date().toISOString().slice(0, 10),
    });

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

    const groupByMonth = (income) => {
        return income.reduce((months, record) => {
            const date = new Date(record.date);
            const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
            if (!months[monthYear]) {
                months[monthYear] = {};
            }

            if (!months[monthYear][date.toLocaleDateString()]) {
                months[monthYear][date.toLocaleDateString()] = { totalAmount: 0, income: [] };
            }

            months[monthYear][date.toLocaleDateString()].totalAmount += record.incomeAmount;
            months[monthYear][date.toLocaleDateString()].income.push(record);

            return months;
        }, {});
    };

    const groupedIncome = groupByMonth(income);

    const handleModalClose = () => {
        setShowAddModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
        setSelectedIncome(null);
        setNewIncome({
            incomeName: '',
            sourceId: '',
            incomeDescription: '',
            incomeAmount: '',
            date: new Date().toISOString().slice(0, 10),
        });
    };

    const handleAddModalShow = () => setShowAddModal(true);

    const handleEditModalShow = (record) => {
        setSelectedIncome(record);
        setNewIncome({
            incomeName: record.incomeName,
            sourceId: record.sourceId || '',
            incomeDescription: record.incomeDescription,
            incomeAmount: record.incomeAmount,
            date: record.date.slice(0, 10),
        });
        setShowEditModal(true);
    };

    const handleDeleteModalShow = (record) => {
        setSelectedIncome(record);
        setShowDeleteModal(true);
    };

    const handleChange = (e) => {
        setNewIncome({
            ...newIncome,
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
                `${process.env.REACT_APP_API_BASE_URL}/incomes`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        incomeName: newIncome.incomeName,
                        sourceId: newIncome.sourceId || null,
                        incomeDescription: newIncome.incomeDescription,
                        incomeAmount: newIncome.incomeAmount,
                        date: newIncome.date,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const addedIncome = await response.json();
            setIncome([...income, addedIncome]);
            handleModalClose();
        } catch (error) {
            console.error("Error adding income:", error);
            setError("Error adding income");
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
                `${process.env.REACT_APP_API_BASE_URL}/incomes/${selectedIncome._id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        incomeName: newIncome.incomeName,
                        sourceId: newIncome.sourceId || null,
                        incomeDescription: newIncome.incomeDescription,
                        incomeAmount: newIncome.incomeAmount,
                        date: newIncome.date,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const updatedIncome = await response.json();
            setIncome(income.map(record =>
                record._id === updatedIncome._id ? updatedIncome : record
            ));
            handleModalClose();
        } catch (error) {
            console.error("Error updating income:", error);
            setError("Error updating income");
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
                `${process.env.REACT_APP_API_BASE_URL}/incomes/${selectedIncome._id}`,
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

            setIncome(income.filter(record => record._id !== selectedIncome._id));
            handleModalClose();
        } catch (error) {
            console.error("Error deleting income:", error);
            setError("Error deleting income");
        }
    };


    return (
        <Container className="mt-5">
            <h1>Your Income:</h1>
            <Button variant="primary" onClick={handleAddModalShow} className="mb-3">
                Add Income
            </Button>
            {loading ? (
                <Spinner animation="border" />
            ) : error ? (
                <p>{error}</p>
            ) : Object.keys(groupedIncome).length === 0 ? (
                <p>No income found.</p>
            ) : (
                <Accordion>
                    {Object.keys(groupedIncome).map((monthYear, index) => (
                        <Accordion.Item key={monthYear} eventKey={`${index}`}>
                            <Accordion.Header>
                                <div className="w-100 d-flex justify-content-between align-items-center">
                                    <h4>{monthYear}</h4>
                                    <span>Total: ₱{
                                        Object.values(groupedIncome[monthYear]).reduce(
                                            (total, day) => total + day.totalAmount, 0
                                        ).toFixed(2)
                                    }</span>
                                </div>
                            </Accordion.Header>
                            <Accordion.Body>
                                <Accordion>
                                    {Object.keys(groupedIncome[monthYear]).map((date, subIndex) => (
                                        <Accordion.Item key={date} eventKey={`${index}-${subIndex}`}>
                                            <Accordion.Header>
                                                <div className="w-100 d-flex justify-content-between align-items-center">
                                                    <h5>{date}</h5>
                                                    <span>Total: ₱{
                                                        groupedIncome[monthYear][date].totalAmount.toFixed(2)
                                                    }</span>
                                                </div>
                                            </Accordion.Header>
                                            <Accordion.Body>
                                                <Accordion>
                                                    {groupedIncome[monthYear][date].income.map(income => (
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
                                                                <div className="mt-3">
                                                                    <Button
                                                                        variant="warning"
                                                                        onClick={() => handleEditModalShow(income)}
                                                                        className="me-2"
                                                                    >
                                                                        Edit
                                                                    </Button>
                                                                    <Button
                                                                        variant="danger"
                                                                        onClick={() => handleDeleteModalShow(income)}
                                                                    >
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

            {/* Add Income Modal */}
            <Modal show={showAddModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Income</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddSubmit}>
                        <Form.Group controlId="formIncomeName">
                            <Form.Label>Income Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="incomeName"
                                value={newIncome.incomeName}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formSourceId">
                            <Form.Label>Source (Optional)</Form.Label>
                            <Form.Control
                                as="select"
                                name="sourceId"
                                value={newIncome.sourceId}
                                onChange={handleChange}
                            >
                                <option value="">Select Source (Optional)</option>
                                {sources.map(source => (
                                    <option key={source._id} value={source._id}>
                                        {source.sourceName}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="formIncomeDescription">
                            <Form.Label>Income Description</Form.Label>
                            <Form.Control
                                type="text"
                                name="incomeDescription"
                                value={newIncome.incomeDescription}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formIncomeAmount">
                            <Form.Label>Income Amount</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                name="incomeAmount"
                                value={newIncome.incomeAmount}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formDate">
                            <Form.Label>Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="date"
                                value={newIncome.date}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3">
                            Add Income
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Edit Income Modal */}
            <Modal show={showEditModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Income</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleEditSubmit}>
                        <Form.Group controlId="formIncomeName">
                            <Form.Label>Income Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="incomeName"
                                value={newIncome.incomeName}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formSourceId">
                            <Form.Label>Source (Optional)</Form.Label>
                            <Form.Control
                                as="select"
                                name="sourceId"
                                value={newIncome.sourceId}
                                onChange={handleChange}
                            >
                                <option value="">Select Source (Optional)</option>
                                {sources.map(source => (
                                    <option key={source._id} value={source._id}>
                                        {source.sourceName}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="formIncomeDescription">
                            <Form.Label>Income Description</Form.Label>
                            <Form.Control
                                type="text"
                                name="incomeDescription"
                                value={newIncome.incomeDescription}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formIncomeAmount">
                            <Form.Label>Income Amount</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                name="incomeAmount"
                                value={newIncome.incomeAmount}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formDate">
                            <Form.Label>Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="date"
                                value={newIncome.date}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3">
                            Save Changes
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Delete Income Modal */}
            <Modal show={showDeleteModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Income</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this income?</p>
                    <Button variant="danger" onClick={handleDeleteSubmit}>
                        Delete
                    </Button>
                </Modal.Body>
            </Modal>
        </Container>
    );
}