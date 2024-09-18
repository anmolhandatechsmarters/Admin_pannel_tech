import React, { useEffect, useState } from 'react';
import "./Css/Hrdashboard.css";
import axios from "axios";

const Hremployeedashboard = () => {
  const [countTotalEmployee, setCountTotalEmployee] = useState(0);
  const [activeEmployee, setActiveEmployee] = useState(0);
  const [inactiveEmployee, setInactiveEmployee] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const totalResult = await axios.get("http://localhost:7000/api/hr/hrcountemployee", {
          headers: {
            "Content-Type": "application/json"
          }
        });
        setCountTotalEmployee(totalResult.data.count); // Extracting count

        const activeResult = await axios.get("http://localhost:7000/api/hr/hractiveemployee", {
          headers: {
            "Content-Type": "application/json"
          }
        });
        setActiveEmployee(activeResult.data.count); // Extracting count

        const inactiveResult = await axios.get("http://localhost:7000/api/hr/hrinactiveemployee", {
          headers: {
            "Content-Type": "application/json"
          }
        });
        setInactiveEmployee(inactiveResult.data.count); // Extracting count
      } catch (error) {
        console.log(error);
      }
    };

    fetchData(); // Call the fetch function
  }, []); // Dependency array to run only on mount

  return (
    <div>
      <div className="dashboard-container">
        <div className="dashboard-card">
          <div className="dashboard-card-content">
            <div className="dashboard-user-number">
              {countTotalEmployee}
            </div>
            <div className="dashboard-label">
              Total number of Employees
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-content">
            <div className="dashboard-user-number">
              {activeEmployee}
            </div>
            <div className="dashboard-label">
              Total active Employees
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-content">
            <div className="dashboard-user-number">
              {inactiveEmployee}
            </div>
            <div className="dashboard-label">
              Total Inactive Employees
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hremployeedashboard;
