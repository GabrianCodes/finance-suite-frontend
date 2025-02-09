import { useState, useEffect, useContext } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import UserContext from '../UserContext'
import { Navigate } from 'react-router-dom';
import Swal from 'sweetalert2'

export default function Register() {

	const { user } = useContext(UserContext);

	// State hooks to store the values of the input fields
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	// State to determine whether submit button is enabled or not
	const [isActive, setIsActive] = useState(false);

	// Error states
	const [usernameError, setUsernameError] = useState("");
	const [emailError, setEmailError] = useState("");
	const [passwordError, setPasswordError] = useState("");


	// Function to register the user
	function registerUser(e) {
		e.preventDefault();

		// Clear previous errors
		setUsernameError("");
		setEmailError("");
		setPasswordError("");

		// fetch API
		fetch(`${process.env.REACT_APP_API_BASE_URL}/users/`, {
			method: 'POST',
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				username: username,
				email: email,
				password: password
			})
		})
		.then(res => res.json())
		.then(data => {
			if (data.message === "Registered Successfully") {
				// Reset all of the input fields
				setUsername("");
				setEmail("");
				setPassword("");
				setConfirmPassword("");

				Swal.fire('Success', 'Registration successful!', 'success').then(() => {
					window.location.href = '/login';
				});

			} else {
				// Handle various error messages
				if (data.error === "Username already exists") {
					setUsernameError("Username already exists");
				} else if (data.error === "Email already exists") {
					setEmailError("Email already exists");
				} else if (data.error === "Email invalid") {
					setEmailError("Email is invalid");
				} else if (data.error === "Password must be at least 8 characters") {
					setPasswordError("Password must be at least 8 characters");
				} else {
					Swal.fire('Error', 'Something went wrong. Please try again.', 'error');
				}
			}
		});
	}

	// Effect to handle form validation
	useEffect(() => {
		if ((username !== "" && email !== "" && password !== "" && confirmPassword !== "") && (password === confirmPassword)) {
			setIsActive(true);
		} else {
			setIsActive(false);
		}
	}, [username, email, password, confirmPassword]);

	return (
		(user.id !== null) ?
			<Navigate to="/" />
		:
			<Form onSubmit={(e) => registerUser(e)}>

				<h1 className="my-5 text-center">Register</h1>

				<Form.Group>
					<Form.Label>Username:</Form.Label>
					<Form.Control 
						type="text" 
						placeholder="Enter Username" 
						required 
						value={username}
						isInvalid={!!usernameError}
						onChange={(e) => setUsername(e.target.value)}
					/>
					{/* Error message for username */}
					{usernameError && <Alert variant="danger">{usernameError}</Alert>}
				</Form.Group>

				<Form.Group>
					<Form.Label>Email:</Form.Label>
					<Form.Control 
						type="email" 
						placeholder="Enter Email" 
						required 
						value={email}
						isInvalid={!!emailError}
						onChange={(e) => setEmail(e.target.value)}
					/>
					{/* Error message for email */}
					{emailError && <Alert variant="danger">{emailError}</Alert>}
				</Form.Group>

				<Form.Group>
					<Form.Label>Password:</Form.Label>
					<Form.Control 
						type="password" 
						placeholder="Enter Password" 
						required 
						value={password}
						isInvalid={!!passwordError}
						onChange={(e) => setPassword(e.target.value)}
					/>
					{/* Error message for password */}
					{passwordError && <Alert variant="danger">{passwordError}</Alert>}
				</Form.Group>

				<Form.Group>
					<Form.Label>Confirm Password:</Form.Label>
					<Form.Control 
						type="password" 
						placeholder="Confirm Password" 
						required 
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
					/>
				</Form.Group>

				{/* Conditionally render the submit button based on the isActive state */}
				{isActive ? 
					<Button variant="primary" type="submit">Submit</Button>
					: 
					<Button variant="danger" type="submit" disabled>Submit</Button>
				}
			</Form>
	);
}