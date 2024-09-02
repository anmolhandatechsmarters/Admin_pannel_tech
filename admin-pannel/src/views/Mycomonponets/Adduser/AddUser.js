import React, { useState, useEffect } from 'react';
import axios from 'axios';
import countriesData from '../../../views/pages/register/countries.json';
import statesData from '../../../views/pages/register/states.json';
import citiesData from '../../../views/pages/register/cities.json';
import "../CSS/AddUser.css";

const Register = () => {
    const [getipa,setgetip]=useState('')
    useEffect(() => {
        const fetchIp = async () => {
            try {
                const response = await axios.get('https://api.ipify.org?format=json');
                setgetip(response.data.ip);
                console.log("ip",response.data.ip)
            } catch (error) {
                console.error('Error fetching IP:', error);
            }
        };

        fetchIp();
    }, []); 

    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '', // Added
        last_name: '',  // Added
        role: '',
        country: '',
        state: '',
        city: '',
        street1: '',
        street2: '',
        user_agent: navigator.userAgent,
        ip:getipa,
    });




    const [options, setOptions] = useState({
        roles: ['HR', 'Employee'],
        countries: [],
        states: [],
        cities: []
    });

    useEffect(() => {
        // Ensure data is arrays
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
            // Filter states based on selected country
            const filteredStates = statesData.states.filter(state => state.country_id === value);
            setOptions(prevOptions => ({
                ...prevOptions,
                states: filteredStates,
                cities: []
            }));
            setFormData(prevFormData => ({ ...prevFormData, state: '', city: '' }));
        }

        if (name === 'state') {
            // Filter cities based on selected state
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
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log(result.data);
            console.log(getipa)
            alert('Registration successful!');
        } catch (error) {
            console.error('Error submitting form', error);
            alert('Registration failed.');
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
                            required
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
                            required
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

export default Register;

