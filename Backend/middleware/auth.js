const { verifyusertoken } = require('./token');

const authentication = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, 'anmol', (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Failed to authenticate token' });
    req.user = decoded;
    next();
  });
};

// authorize.js
const authorize = (allowedRoles) => (req, res, next) => {
  const userRole = req.user.role;
  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

module.exports = authorize;


module.exports = { authentication, authorize };