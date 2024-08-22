import { useState, useEffect, useContext } from 'react';
import {Form, Button} from 'react-bootstrap';
import UserContext from '../UserContext'
import { Navigate } from 'react-router-dom';
import Swal from 'sweetalert2'


export default function Login() {

	// use global state with help of context to pass data
	const { user, setUser } = useContext(UserContext);


	// State hooks to store the values of the input fields
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const [isActive, setIsActive] = useState(false);

	function authenticate(e) {

		e.preventDefault();

		fetch(`${process.env.REACT_APP_API_BASE_URL}/users/login`, {
			method: 'POST',
			headers: {
				"Content-Type": 'application/json'
			},
			body: JSON.stringify({
				email: email,
				password: password
			})
		})
		.then(res => res.json())
		.then(data => {

			// data.access contains the JWT of the user
			if(data.access) {

				// Save the token of the authenticated user in the local storage (key-value pair)
				// Sytax:
					// localStorage.setItem('propertyName', value);
				localStorage.setItem('token', data.access);

				// to retrieve the user details and also usse the user details to set our "user" state
				retrieveUserDetails(data.access)

				Swal.fire({
					title: "Login Successful",
					icon: "success",
					text: "Welcome to Your account"
				});

				// Clear input fields after submission
				setEmail('');
				setPassword('');

			} else if(data.error === "No Email Found") {

				Swal.fire({
					title: "Something went wrong",
					icon: "error",
					text: `${email} does not exist.`
				});

			} else {

				Swal.fire({
					title: "Something went wrong",
					icon: "error",
					text: "Check your login details and try again."
				});
			}

			

		})


	}

	const retrieveUserDetails = (token) => {

		fetch(`${process.env.REACT_APP_API_BASE_URL}/users/details`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		})
		.then(res => res.json())
		.then(data => {

			console.log("Retrieved User Data ", data);

			// Change the global "user" state to store the "id" and "isAdmin" property of the user
			setUser({
				id: data.user._id,
				isAdmin: data.user.isAdmin

			})

		})

	}


	useEffect(() => {

		// Form Validation
		if(email !== '' && password !== ''){
			setIsActive(true);
		} else {
			setIsActive(false);
		}

	}, [email, password]);


	return (
		
		(user.id !== null) ?
			<Navigate to="/" />
		:
			<Form onSubmit={(e) => authenticate(e)}>
				<h1 className="my-5 text-center">Login</h1>
				<Form.Group controlId="userEmail">
					<Form.Label>Email address</Form.Label>
					<Form.Control 
						type="email" 
						placeholder="Enter email" 
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</Form.Group>

				<Form.Group controlId="password">
					<Form.Label>Password</Form.Label>
					<Form.Control 
						type="password" 
						placeholder="Password" 
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</Form.Group>

				{ isActive ?
					<Button variant="primary" type="submit" id="submitBtn">
						Submit
					</Button>
					:
					<Button variant="danger" type="submit" id="submitBtn" disabled>
						Submit
					</Button>
				}

			</Form>  
	)
}