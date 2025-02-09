import { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';
import { UserProvider } from './UserContext'

//Components
import AppNavbar from './components/AppNavbar';


//Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Incomes from './pages/Incomes';
import ProfitLoss from './pages/ProfitLoss';
import Sources from './pages/Sources';
import SourceTypes from './pages/SourceTypes';



import { Container } from 'react-bootstrap';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {


    const [token, setToken] = useState(null);

    // State hook for the user state that is defined here in a global scope
    // This will be used to store the user information and will be used for validating if a user is logged in on the app or not
    const [user, setUser] = useState({
        id: null,
        isAdmin: null
    });


    const unsetUser = () => {
        localStorage.clear();
        setToken(null); 
    };

    const retrieveUserDetails = (token) => {
        fetch(`${process.env.REACT_APP_API_BASE_URL}/users/details`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log("Retrieved User Data ", data);
            setUser({
                id: data.user._id,
                isAdmin: data.user.isAdmin
            });
        });
    };

    useEffect(() => {
 
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);

            retrieveUserDetails(storedToken);
        }
    }, []);


    useEffect(() => {
 
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);

            retrieveUserDetails(storedToken);
        }
    }, []);
    // the routes dont forget if u just see a white screen
    return (
        <UserProvider value={{ user, setUser, unsetUser }}>

            <Router>
                <AppNavbar/>
                <Container fluid>
                    <Routes>
                      <Route path="/" element={<Home />}  />
                      <Route path="/login" element={<Login />}  />
                      <Route path="/logout" element={<Logout />}  />
                      <Route path="/register" element={<Register />}  />
                      <Route path="/dashboard" element={<Dashboard />}  />
                      <Route path="/expenses" element={<Expenses />}  />
                      <Route path="/incomes" element={<Incomes />}  />
                      <Route path="/profitloss" element={<ProfitLoss />}  />
                      <Route path="/sources" element={<Sources />}  />
                      <Route path="/sourcetypes" element={<SourceTypes />}  />

                    </Routes>
                </Container>
            </Router>
        </UserProvider>
    );

}

export default App;
