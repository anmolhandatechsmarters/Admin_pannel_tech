import React, { useState, useEffect } from 'react';
import { countries, states, cities } from './CountryData.js';
import axios from 'axios';
import './Resgister.css';

const RegistrationForm = () => {
    const [ip, setIp] = useState('');

    const [role, setRole] = useState('');
    const userAgent = navigator.userAgent;
    const [formData, setFormData] = useState({
        email: '',
        emp_id: '',
        password: '',
        confirmPassword: '',
        role: '',
        first_name: '',
        last_name: '',
        street1: '',
        street2: '',
        city: '',
        state: '',
        country: '',
        ip: '',
        user_agent: userAgent,
    });

    const [stateList, setStateList] = useState([]);
    const [cityList, setCityList] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedState, setSelectedState] = useState('');

    useEffect(() => {
        const fetchIp = async () => {
            try {
                const response = await axios.get("https://api.ipify.org?format=json");
                setIp(response.data.ip);
                setFormData(prevData => ({ ...prevData, ip: response.data.ip }));
            } catch (error) {
                console.error("Error fetching IP", error);
            }
        };

        fetchIp();
    }, []); // Empty dependency array to run only once on mount

    useEffect(() => {
        if (selectedCountry) {
            setStateList(states[selectedCountry] || []);
            setCityList([]);
            setSelectedState('');
            setFormData(prevData => ({ ...prevData, state: '', city: '' }));
        }
    }, [selectedCountry]);

    useEffect(() => {
        if (selectedState) {
            const stateCities = cities[selectedCountry] ? cities[selectedCountry][selectedState] : [];
            setCityList(stateCities || []);
            setFormData(prevData => ({ ...prevData, city: '' }));
        }
    }, [selectedState, selectedCountry]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleCountryChange = (e) => {
        const value = e.target.value;
        setSelectedCountry(value);
        setFormData(prevData => ({
            ...prevData,
            country: value,
            state: '',
            city: ''
        }));
    };

    const handleStateChange = (e) => {
        const value = e.target.value;
        setSelectedState(value);
        setFormData(prevData => ({
            ...prevData,
            state: value,
            city: ''
        }));
    };

    const handleRoleChange = (e) => {
        const value = e.target.value;
        setRole(value);
        setFormData(prevData => ({ ...prevData, role: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if password and confirm password match
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        // Check if required fields are filled
        const requiredFields = ['email', 'password', 'confirmPassword', 'first_name', 'last_name', 'street1', 'city', 'state', 'country'];
        for (const field of requiredFields) {
            if (!formData[field]) {
                alert(`${field.replace(/([A-Z])/g, ' $1').toUpperCase()} is required.`);
                return;
            }
        }

        try {
            const result = await axios.post('http://localhost:7000/user/submitdata', formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log(result.data);
        } catch (error) {
            console.error('Error submitting form data', error);
        }
    };

    return (
        <div className="Register-container">
            <h1>Register</h1>
            <form className="registration-form" onSubmit={handleSubmit}>
                <div className="row">
                    <div className="register-form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="register-form-group">
                        <label htmlFor="role">Role:</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleRoleChange}
                            required
                        >
                            <option value="">Select Role</option>
                            <option value="Admin">Admin</option>
                            <option value="Hr">Hr</option>
                            <option value="Employee">Employee</option>
                        </select>
                    </div>

                    <div className="register-form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="register-form-group">
                        <label htmlFor="confirmPassword">Confirm Password:</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="register-form-group">
                        <label htmlFor="first_name">First Name:</label>
                        <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="register-form-group">
                        <label htmlFor="last_name">Last Name:</label>
                        <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="register-form-group">
                        <label htmlFor="country">Country:</label>
                        <select
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleCountryChange}
                            required
                        >
                            <option value="">Select Country</option>
                            {countries.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="register-form-group">
                        <label htmlFor="state">State:</label>
                        <select
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleStateChange}
                            required
                        >
                            <option value="">Select State</option>
                            {stateList.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="register-form-group">
                        <label htmlFor="city">City:</label>
                        <select
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select City</option>
                            {cityList.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="register-form-group">
                        <label htmlFor="street1">Street 1:</label>
                        <input
                            type="text"
                            id="street1"
                            name="street1"
                            value={formData.street1}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="register-form-group">
                        <label htmlFor="street2">Street 2:</label>
                        <input
                            type="text"
                            id="street2"
                            name="street2"
                            value={formData.street2}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <button type="submit" className="register-button">Register</button>
            </form>
        </div>
    );
};

export default RegistrationForm;
