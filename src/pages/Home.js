import Banner from '../components/Banner';
import { useState, useEffect, useContext } from 'react';
import UserContext from '../UserContext'
import '../App.css'

export default function Home() {

	const { user } = useContext(UserContext);

    // Logic to determine user role (unregistered, admin, or normal user)


    // Define data object based on user role
    let data = {
        title: "",
        content: "",
        destination: "",
        label: "",
        destination2: "",
        label2: ""
    };

    // Set data based on user role
    if (user.isAdmin === true && user.id !== null) {
        data = {
            title: "Welcome Admin",
            content: "You may go to the dashboard.",
            destination: "/",
            label: "Go to Admin Dashboard"
        };
    } else if (user.id !== null && user.isAdmin === false) {
        data = {
            title: "Finance Suite",
            content: "Finance Simplified",
            destination: "/dashboard",
            label: "Go to Dashboard"
        };
    } else {
        data = {
            title: "Finance Suite",
            content: "Finance Simplified",
            destination: "/register",
            label: "Create an Account!",
            destination2: "/login",
            label2: "Login!"
        };
    }


    return (
        <div className='home-container bg-light'>
            <Banner data={data} />
        </div>
    );
}