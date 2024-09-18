import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./Designation.css";
import { MdDelete, MdEdit } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const DepartmentManagement = () => {
    const navigate = useNavigate();
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
            const result = await axios.get("http://localhost:7000/admin/getdesignation", {
                params: {
                    page,
                    limit,
                    search: searchTerm
                }
            });
            setDepartments(result.data.designations);
            setTotal(result.data.total);
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
            fetchDepartments();
        } catch (error) {
            console.error("Error adding department:", error);
        }
    };

    const handleEditDepartment = async (id) => {
        try {
            await axios.put(`http://localhost:7000/admin/editdesignation/${id}`, { name: editValue, logid:logid }, {
                headers: { "Content-Type": "application/json" }
            });
            setEditingDepartment(null);
            setEditValue('');
            fetchDepartments();
        } catch (error) {
            console.error("Error editing department:", error);
        }
    };

    const handleDeleteDepartment = async (id) => {
        const confirm = window.confirm("Are you sure you want to delete the department?");
        if (confirm) {
            try {
                await axios.delete(`http://localhost:7000/admin/deletedesignation/${id}`);
                fetchDepartments();
            } catch (error) {
                console.error("Error deleting department:", error);
            }
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
        navigate("/adddesignation");
    };

    return (
        <div className="department-management">
            <h1>Designation Management</h1>

            <div className="actions">
                <button onClick={handlemovedepartment}>Add Designation</button>
            </div>

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
                                            value={editValue || ''} // Ensures controlled input
                                            onChange={(e) => setEditValue(e.target.value)}
                                            autoFocus
                                        />
                                    ) : (
                                        item.designation_name
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
                                                setEditValue(item.designation_name); // Updated to use designation_name
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
