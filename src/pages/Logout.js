import { Navigate } from 'react-router-dom';
import { useEffect, useContext } from 'react';
import UserContext from '../UserContext'

export default function Logout() {

	const { unsetUser, setUser } = useContext(UserContext);


	unsetUser();

	useEffect(() => {

        setUser({ 
        	id: null,
        	isAdmin: null
        });

    }, []);

	// Navigate component allows us to redirect to different page in our application
	return (

		<Navigate to="/login" />
	)
}