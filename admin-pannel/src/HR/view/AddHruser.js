import React, { useState, useEffect } from 'react';
import axios from 'axios';
import countriesData from '../../views/pages/register/countries.json';
import statesData from '../../views/pages/register/states.json';
import citiesData from '../../views/pages/register/cities.json';
import Swal from 'sweetalert2';
import "./Css/Addhruser.css";
import {useNavigate} from "react-router-dom"
const AddHruser = () => {
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
    const navigate =useNavigate()
    const id = localStorage.getItem("id");
    const [getipa, setgetip] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: '',
        country: '',
        state: '',
        city: '',
        street1: '',
        street2: '',
        department: '',
        designation: '',
        user_agent: navigator.userAgent,
        ip: getipa,
        id: id
    });

    const [options, setOptions] = useState({
        roles: ['HR', 'Employee'],
        countries: [],
        states: [],
        cities: [],

    });

    const [department, setdepartment] = useState([])
    const [designation, setdesignation] = useState([])


    useEffect(() => {
        const fetchIp = async () => {
            try {
                const response = await axios.get('https://api.ipify.org?format=json');
                setgetip(response.data.ip);
                setFormData(prevFormData => ({ ...prevFormData, ip: response.data.ip }));
            } catch (error) {
                console.error('Error fetching IP:', error);
            }
        };


        const fetchdepartment = async () => {
            try {
                const result = await axios.get('http://localhost:7000/admin/getadmindepartment')
                setdepartment(result.data)
            } catch (error) {
                console.log(error)
            }

        }
        const fetchdesignaiton = async () => {
            try {
                const result = await axios.get('http://localhost:7000/admin/getadmindesignation')
                setdesignation(result.data)
            } catch (error) {
                console.log(error)
            }

        }
fetchdepartment()
fetchdesignaiton()

        fetchIp();
    }, []);

    useEffect(() => {
        
        if (Array.isArray(countriesData.countries)) {
            setOptions(prevOptions => ({
                ...prevOptions,
                countries: countriesData.countries
            }));
        } else {
            console.error('Countries data is not an array:', countriesData.countries);
        }

        if (Array.isArray(statesData.states)) {
            setOptions(prevOptions => ({
                ...prevOptions,
                states: statesData.states
            }));
        } else {
            console.error('States data is not an array:', statesData.states);
        }

        if (Array.isArray(citiesData.cities)) {
            setOptions(prevOptions => ({
                ...prevOptions,
                cities: citiesData.cities
            }));
        } else {
            console.error('Cities data is not an array:', citiesData.cities);
        }

       
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({ ...prevFormData, [name]: value }));

        if (name === 'country') {
            const filteredStates = statesData.states.filter(state => state.country_id === value);
            setOptions(prevOptions => ({
                ...prevOptions,
                states: filteredStates,
                cities: [] 
            }));
            setFormData(prevFormData => ({ ...prevFormData, state: '', city: '' }));
        }

        if (name === 'state') {
            const filteredCities = citiesData.cities.filter(city => city.state_id === value);
            setOptions(prevOptions => ({
                ...prevOptions,
                cities: filteredCities
            }));
            setFormData(prevFormData => ({ ...prevFormData, city: '' }));
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await axios.post('http://localhost:7000/admin/adduser', formData, {
                params:{logip},
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: result.data.message || 'User added successfully!',
                confirmButtonText: 'OK'
            });
            setTimeout(() => {
                navigate("/hremployeeshow");
            }, 2000);
        } catch (error) {
            console.error('Error submitting form', error);
    
           
            if (error.response && error.response.data) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops!',
                    text: error.response.data.message || 'Error occurred while adding the user.',
                    confirmButtonText: 'Try Again'
                });
            } else {
            
                Swal.fire({
                    icon: 'error',
                    title: 'Oops!',
                    text: 'Error occurred while adding the user.',
                    confirmButtonText: 'Try Again'
                });
            }
        }
    };
    

    return (
        <div className="adminadduser-container">
            <h1>Add User</h1>
            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col">
                        <label>First Name:</label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col">
                        <label>Last Name:</label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col">
                        <label>Password:</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <label>Role:</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a role</option>
                            {options.roles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col">
                        <label>Country:</label>
                        <select
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a country</option>
                            {options.countries.map(country => (
                                <option key={country.id} value={country.id}>{country.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <label>State:</label>
                        <select
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                    
                        >
                            <option value="">Select a state</option>
                            {options.states
                                .filter(state => state.country_id === formData.country)
                                .map(state => (
                                    <option key={state.id} value={state.id}>{state.name}</option>
                                ))}
                        </select>
                    </div>

                    <div className="col">
                        <label>City:</label>
                        <select
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                        
                        >
                            <option value="">Select a city</option>
                            {options.cities
                                .filter(city => city.state_id === formData.state)
                                .map(city => (
                                    <option key={city.id} value={city.id}>{city.name}</option>
                                ))}
                        </select>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <label>Department:</label>
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a department</option>
                            {department.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.department_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col">
                        <label>Designation:</label>
                        <select
                            name="designation"
                            value={formData.designation}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a designation</option>
                            {designation
                                .map(designation => (
                                    <option key={designation.id} value={designation.id}>
                                        {designation.designation_name}
                                    </option>
                                ))}
                        </select>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <label>Street 1:</label>
                        <input
                            type="text"
                            name="street1"
                            value={formData.street1}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col">
                        <label>Street 2:</label>
                        <input
                            type="text"
                            name="street2"
                            value={formData.street2}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <button type="submit">Add User</button>
            </form>
        </div>
    );
};

export default AddHruser;
