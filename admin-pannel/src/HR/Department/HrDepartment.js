import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./HrDepartment.css";
import { MdDelete, MdEdit } from "react-icons/md";
import { useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
const DepartmentManagement = () => {
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
    const navigate = useNavigate()
    const logid = localStorage.getItem("id");
    const [departments, setDepartments] = useState([]);
    const [newDepartment, setNewDepartment] = useState('');
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    useEffect(() => {
        fetchDepartments();
    }, [page, searchTerm]);

    const fetchDepartments = async () => {
        try {
            const result = await axios.get("http://localhost:7000/admin/getdeparmentdetail", {
                params: {
                    page,
                    limit,
                    search: searchTerm
                }
            });
            setDepartments(result.data.departments);
            setTotal(result.data.total); // Update total count
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    };

    const handleAddDepartment = async () => {
        try {
            await axios.post("http://localhost:7000/admin/adddepartment", { name: newDepartment }, {
                headers: { "Content-Type": "application/json" }
            });
            setNewDepartment('');
            fetchDepartments(); // Refresh the list of departments
        } catch (error) {
            console.error("Error adding department:", error);
        }
    };

    const handleEditDepartment = async (id) => {
        try {
            await axios.put(`http://localhost:7000/admin/editdepartment/${id}`, { name: editValue, logid,logip }, {
                headers: { "Content-Type": "application/json" }
            });
            
            // Show success message
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Department updated successfully!',
                confirmButtonText: 'OK'
            });
    
            setEditingDepartment(null);
            setEditValue('');
            fetchDepartments(); // Refresh the list of departments
        } catch (error) {
            console.error("Error editing department:", error);
    
            // Show specific error messages based on the response
            if (error.response && error.response.data && error.response.data.message) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops!',
                    text: error.response.data.message,
                    confirmButtonText: 'Try Again'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops!',
                    text: 'There was a problem updating the department.',
                    confirmButtonText: 'Try Again'
                });
            }
        }
    };
    
    

    const handleDeleteDepartment = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You won’t be able to revert this!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it',
        });
    
        if (result.isConfirmed) {
            try {
                const response = await axios.delete(`http://localhost:7000/admin/deletedepartment/${id}`,{
                    params:{logid,logip}
                });
                fetchDepartments(); // Refresh the list of departments
                Swal.fire('Deleted!', 'Your department has been deleted.', 'success');
            } catch (error) {
                console.error("Error deleting department:", error);
    
                // Show specific error messages based on the response
                if (error.response && error.response.data && error.response.data.message) {
                    Swal.fire('Error!', error.response.data.message, 'error');
                } else {
                    Swal.fire('Error!', 'There was a problem deleting the department.', 'error');
                }
            }
        } else {
            Swal.fire('Cancelled', 'Your department is safe :)', 'error');
        }
    };
    

    const handleCancelEdit = () => {
        setEditingDepartment(null);
        setEditValue('');
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= Math.ceil(total / limit)) {
            setPage(newPage);
        }
    };

    const handlemovedepartment = () => {
        navigate("/hradddepartment")
    }
    return (
        <div className="department-management">
            <h1>Department Management</h1>

            {/* <div className="actions"> */}

                <div className="d-grid gap-2 d-md-flex justify-content-md-end actions">
                    <button onClick={handlemovedepartment} className='btn btn-primary'>Add Department</button>
                </div>


            {/* </div> */}

            <div className="search">
                <input
                    type="text"
                    placeholder="Search Departments"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <table>
                <thead>
                    <tr>
                        <th>#Id</th>
                        <th>Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        departments.map(item => (

                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>
                                    {editingDepartment === item.id ? (
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            autoFocus
                                        />
                                    ) : (
                                        item.department_name
                                    )}
                                </td>
                                <td>
                                    {editingDepartment === item.id ? (
                                        <>
                                            <button onClick={() => handleEditDepartment(item.id)}>Save</button>
                                            <button onClick={handleCancelEdit}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <MdEdit onClick={() => {
                                                setEditingDepartment(item.id);
                                                setEditValue(item.department_name);
                                            }} />
                                            <MdDelete onClick={() => handleDeleteDepartment(item.id)} />
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>

            <div className="pagination">
                <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
                    Previous
                </button>
                <span>Page {page} of {Math.ceil(total / limit)}</span>
                <button onClick={() => handlePageChange(page + 1)} disabled={page === Math.ceil(total / limit)}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default DepartmentManagement;
