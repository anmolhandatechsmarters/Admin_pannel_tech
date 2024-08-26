const jwt= require("jsonwebtoken")
const secrete_key="anmol"



//Generate the user token 
const Generatetoken = (user_id) => {
    const token = jwt.sign({ id: user_id }, secrete_key);
    return token;
  };
  
  // Verify the user token 
  const verifyusertoken = (token) => {
    try {
      const verytoken = jwt.verify(token, secrete_key);
      return verytoken;
    } catch (error) {
      throw new Error('Token verification failed');
    }
  };
  
  module.exports = { Generatetoken, verifyusertoken };
//
