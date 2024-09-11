import axios from 'axios'
import React, { useEffect, useState } from 'react'
import "./CSS/Detailemployee.css"
import { FaCamera } from "react-icons/fa";
const Detailemployee = () => {
  const [user,setuser]=useState('')
  const id=localStorage.getItem("id")
useEffect(()=>{
async function Fetchuserdata(){
 try{
  const result=await axios.get(`http://localhost:7000/employee/getdata/${id}`,{

    headers:{
      "Content-Type":'application/json'
    }
  })
  setuser(result.data)
 
 }catch(error){
console.log(error)
 }
}
Fetchuserdata();
})




  return (
    <>
   <div className='Employee-main-container'>
<div className='first-box-row'>
  <div className='first-box'>
<img src={`http://localhost:7000/${user.Image}`} alt="User Image" />
<FaCamera />

  </div>


</div>


<div className='first-box-col'>
<h3><span>Name</span>   {user.first_name} {user.last_name}</h3>

<h3><span>Name</span>   {user.email}</h3>
<h3><span>Name</span>   {user.emp_id}</h3>
<h3><span>Name</span>   {user.role}</h3>

</div>

<div>
  <button>Mark Attendance</button>
</div>



   </div>
    
    
    </>
  )
}

export default Detailemployee