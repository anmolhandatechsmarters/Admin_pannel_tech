import React, { useState,useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Departmentadd.css'; // Import the CSS file
import {useNavigate} from "react-router-dom"
const DepartmentAdd = () => {

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

    const [newDepartment, setNewDepartment] = useState('');
const navigate=useNavigate()
    const handleAddDepartment = async (e) => {
        e.preventDefault(); // Prevent form submission
        try {
            const response = await axios.post("http://localhost:7000/admin/adddepartment", { name: newDepartment,logip,logid }, {
                headers: { "Content-Type": "application/json" }
            });
            setNewDepartment('');
            // Show success message
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.data.message || 'Department added successfully!',
                confirmButtonText: 'OK'
            });
            setTimeout(()=>{
                navigate("/alldepartment")
            },2000)

        } catch (error) {
            console.error("Error adding department:", error);
            
            // Check if it's a 409 error for existing department
            if (error.response && error.response.status === 409) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Warning!',
                    text: 'Department already exists.',
                    confirmButtonText: 'OK'
                });

            } else {
                // Show generic error message
                Swal.fire({
                    icon: 'error',
                    title: 'Oops!',
                    text: 'Error occurred while adding the department.',
                    confirmButtonText: 'Try Again'
                });
            }
        }
    };

    return (
        <div className='departmentadd-admin'>
            <div className="form-container">
                <form onSubmit={handleAddDepartment} className="department-form">
                    <div className="form-group">
                        <label htmlFor="departmentName">Add New Department</label>
                        <input
                            id="departmentName"
                            type="text"
                            placeholder="Enter Department Name"
                            value={newDepartment}
                            onChange={(e) => setNewDepartment(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="add-button">Add</button>
                </form>
            </div>
        </div>
    );
};

export default DepartmentAdd;
