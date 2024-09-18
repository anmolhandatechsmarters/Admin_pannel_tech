import React ,{useState}from 'react'
import axios from "axios"
const Departmentadd = () => {
    const [newDepartment, setNewDepartment] = useState('')
    const handleAddDepartment = async () => {
        try {
            await axios.post("http://localhost:7000/admin/adddepartment", { name: newDepartment }, {
                headers: { "Content-Type": "application/json" }
            });
            setNewDepartment('');
           alert("succefull added")// Refresh the list of departments
        } catch (error) {
            console.error("Error adding department:", error);
        }
    };
  return (
    <>
    <div className="actions">
                <input
                    type="text"
                    placeholder="New Department"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                />
                <button onClick={handleAddDepartment}>Add Department</button>
            </div>
    
    </>
  )
}

export default Departmentadd