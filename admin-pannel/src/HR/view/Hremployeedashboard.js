import React, { useEffect, useState } from 'react'
import "./Css/Hrdashboard.css"
import axios from "axios"
const Hremployeedashboard = () => {
  const [counttotoalemployee,setcounttotalemployee]=useState(0)
  const [activeemployee,setactiveemployee]=useState(0)
  const [inactiveemployee,setinactiveemployee]=useState(0)

useEffect(()=>{
  async function activeemployee(){
    try{
      const result=await axios.get("http://localhost:7000/api/hr/hrcountemployee",{
        headers:{
          "Content-Type":"application.json"
        }
      }) 

      setcounttotalemployee(result.data)
    }catch(error){
console.log(error)
    }
  }

  async function inactiveemployee(){
    try{
      const result=await axios.get("http://localhost:7000/api/hr/hractiveemployee",{
        headers:{
          "Content-Type":"application.json"
        }
      }) 

      setactiveemployee(result.data)
    }catch(error){
console.log(error)
    }
  }

  async function countemployee(){
    try{
      const result=await axios.get("http://localhost:7000/api/hr/hrinactiveemployee",{
        headers:{
          "Content-Type":"application.json"
        }
      }) 

      setinactiveemployee(result.data)
    }catch(error){
console.log(error)
    }
  }



//call function 
countemployee()
activeemployee()
inactiveemployee()

})




  return (
    <div>
<div className="dashboard-container">
  <div className="dashboard-card">
    <div className="dashboard-card-content">
      <div className="dashboard-user-number">
        {counttotoalemployee
        }
      </div>
      <div className="dashboard-label">
    Total number of Employee
      </div>
    </div>
  </div>

  <div className="dashboard-card">
    <div className="dashboard-card-content">
      <div className="dashboard-user-number">
        {activeemployee}
      </div>
      <div className="dashboard-label">
        Total active Employee
      </div>
    </div>
  </div>

  <div className="dashboard-card">
    <div className="dashboard-card-content">
      <div className="dashboard-user-number">
        {inactiveemployee}
      </div>
      <div className="dashboard-label">
        Total Inactive Employee
      </div>
    </div>
  </div>
</div>




    </div>
  )
}

export default Hremployeedashboard