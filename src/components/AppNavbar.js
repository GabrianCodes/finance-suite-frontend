import { useState, useContext } from 'react';

import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

import { NavLink, Link } from 'react-router-dom';
import UserContext from '../UserContext';
import '../App.css';


export default function AppNavbar() {

	const { user } = useContext(UserContext); 
	
	console.log(user); //check if we received the login token

	return (
		<Navbar style={{ backgroundColor: '#ADD8E6' }} expand="lg" variant="light">
			<Container fluid>
				<Navbar.Brand as={Link} to="/" className="cursive-font">Finance Suite</Navbar.Brand>
				<Navbar.Toggle aria-controls="basic-navbar-nav"/>
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className="ms-auto">
						<Nav.Link as={NavLink} to="/" >Home</Nav.Link>
						
						{(user.id !== null) ?

							user.isAdmin ?
								<>
									<Nav.Link as={Link} to="/setAdmin">Set User Admin</Nav.Link>
									<Nav.Link as={Link} to="/logout">Logout</Nav.Link>
								</>
							:
								<>
									<Nav.Link as={Link} to="/expenses">Expenses</Nav.Link>
									<Nav.Link as={Link} to="/logout">Logout</Nav.Link>
								</>
								
						: 
							<>
								<Nav.Link as={Link} to="/login">Login</Nav.Link>
								<Nav.Link as={Link} to="/register">Register</Nav.Link>
							</>

						}
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	)
}