import React, { useState, useEffect } from 'react';



export default function Sources() {
    const [sourceTypes, setSourceTypes] = useState([]);
    const [sources, setSources] = useState([]);
    const [filteredSources, setFilteredSources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeSourceType, setActiveSourceType] = useState('All'); // Filter state
    const [newSource, setNewSource] = useState({
        sourceName: '',
        sourceImage: '',
        sourceTypeId: '',
        sourceDescription: '',
    });

    // State to control the modal visibility
    const [showModal, setShowModal] = useState(false);

    // Function to fetch source types
    const fetchSourceTypes = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("User token not available");
            }

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/sourcetypes`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            if (Array.isArray(data)) {
                setSourceTypes([{ typeName: 'All', _id: 'all' }, ...data]); // Add "All" option
            } else {
                throw new Error("Unexpected source types data format");
            }
        } catch (error) {
            console.error("Error fetching source types:", error);
            setError(error.message);
        }
    };

    // Function to fetch sources
    const fetchSources = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("User token not available");
            }

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/sources`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            if (Array.isArray(data)) {
                setSources(data);
                setFilteredSources(data); // Initialize with all sources
            } else {
                throw new Error("Unexpected sources data format");
            }
        } catch (error) {
            console.error("Error fetching sources:", error);
            setError(error.message);
        }
    };

    // Filter sources by sourceType
    const filterSourcesByType = (typeId) => {
        setActiveSourceType(typeId);
        if (typeId === 'all') {
            setFilteredSources(sources); // Show all sources if "All" is selected
        } else {
            setFilteredSources(sources.filter(source => source.sourceTypeId === typeId));
        }
    };

    // Handle new source input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewSource({ ...newSource, [name]: value });
    };

    // Handle new source submission
    const handleAddSource = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("User token not available");
            }

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/sources`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newSource),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const addedSource = await response.json();
            setSources([...sources, addedSource]); // Add new source to the list
            filterSourcesByType(activeSourceType); // Refresh filtered list
            setShowModal(false); // Close modal after success
        } catch (error) {
            console.error("Error adding source:", error);
            setError(error.message);
        }
    };

    // useEffect to fetch data when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await fetchSourceTypes();
                await fetchSources();
            } catch (error) {
                setError("Error fetching data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="container">
            {/* Navbar for Source Types */}
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="navbar-nav">
                    {sourceTypes.map((sourceType) => (
                        <button
                            key={sourceType._id}
                            className={`nav-item nav-link ${activeSourceType === sourceType._id ? 'active' : ''}`}
                            onClick={() => filterSourcesByType(sourceType._id)}
                        >
                            {sourceType.typeName}
                        </button>
                    ))}
                </div>
                <button className="btn btn-primary ml-auto" onClick={() => setShowModal(true)}>
                    Add a Source
                </button>
            </nav>

            {/* Modal for adding a new source */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add a New Source</h5>
                                <button type="button" className="close" onClick={() => setShowModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleAddSource}>
                                    <div className="form-group">
                                        <label htmlFor="sourceName">Source Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="sourceName"
                                            name="sourceName"
                                            value={newSource.sourceName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="sourceImage">Source Image (URL)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="sourceImage"
                                            name="sourceImage"
                                            value={newSource.sourceImage}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="sourceTypeId">Source Type</label>
                                        <select
                                            className="form-control"
                                            id="sourceTypeId"
                                            name="sourceTypeId"
                                            value={newSource.sourceTypeId}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select a Source Type</option>
                                            {sourceTypes
                                                .filter(type => type.typeName !== 'All') // Filter out the 'All' option
                                                .map((type) => (
                                                    <option key={type._id} value={type._id}>
                                                        {type.typeName}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="sourceDescription">Source Description</label>
                                        <textarea
                                            className="form-control"
                                            id="sourceDescription"
                                            name="sourceDescription"
                                            value={newSource.sourceDescription}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary">Add Source</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sources Cards */}
            <div className="row mt-4">
                {filteredSources.length > 0 ? (
                    filteredSources.map((source) => (
                        <div key={source._id} className="col-md-4 mb-4">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">{source.sourceName}</h5>
                                    <img src={source.sourceImage} alt={source.sourceName} className="card-img-top" />
                                    <p className="card-text">{source.sourceDescription}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center">No sources available</p>
                )}
            </div>
        </div>
    );
};