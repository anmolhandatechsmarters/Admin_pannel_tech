import axios from 'axios'
import React, { useEffect, useState } from 'react'

import { useParams } from 'react-router-dom'
const ViewUser = () => {
  const {id}=useParams()
  const [user,setuser]=useState(id)
useEffect(()=>{
async function fetchuser(){
  try{
  const response=await axios.get(`http://localhost/admin/viewuser/${id}`,{
    headers:{
      "Content-Type":"application/json",
    }
  })
  console.log(response.data)
  }
  catch(error){
console.log(error)
  }
}

},[])

  return (
  <>
  <div>{user}</div>
  </>

  )
}

export default ViewUser