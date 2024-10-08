import React, { useState,useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Designationadd.css'; // Import the CSS file
import {useNavigate} from "react-router-dom"
const Designation = () => {
    useEffect(() => {
        const fetchIpAddress = async () => {
            try {
                const response = await axios.get('https://api.ipify.org?format=json');
                setIpAddress(response.data.ip);
            } catch (error) {
                console.error('Error fetching IP address:', error);
            }
        };
    
        fetchIpAddress();
    }, []);




    const [logip, setIpAddress] = useState('');
    const logid=localStorage.getItem("id")




    const [newDesignation, setNewDesignation] = useState('');
const navigate=useNavigate()
    const handleAddDesignation = async (e) => {
        e.preventDefault(); // Prevent form submission
        try {
            const response = await axios.post("http://localhost:7000/admin/adddesignation", { name: newDesignation,logid,logip }, {
                headers: { "Content-Type": "application/json" }
            });
            setNewDesignation('');
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Designation added successfully!',
                confirmButtonText: 'OK'
            });
            
        setTimeout(()=>{
            navigate("/alldesignation")
        },2000)
      
       
        } catch (error) {
            console.error("Error adding designation:", error);
            if (error.response && error.response.status === 409) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Warning!',
                    text: 'Designation already exists.',
                    confirmButtonText: 'OK'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops!',
                    text: 'Error occurred while adding the designation.',
                    confirmButtonText: 'Try Again'
                });
            }
        }
    };

    return (
<div className='designationadd-admin'>
        <div className="designation-container">
            <form onSubmit={handleAddDesignation} className="designation-form">
                <div className="form-group">
                    <label htmlFor="designationName">New Designation</label>
                    <input
                        id="designationName"
                        type="text"
                        placeholder="Enter Designation Name"
                        value={newDesignation}
                        onChange={(e) => setNewDesignation(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="add-button">Add</button>
            </form>
        </div>
        </div>
    );
};

export default Designation;
