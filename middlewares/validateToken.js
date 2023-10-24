const jwt = require('jsonwebtoken')
const secretKey = process.env.JWT_SECRET_KEY
const validateToken = (req, res, next) => {
    const token = req.headers.authorization; 
  
    if (!token) {
      return res.status(401).json({ message: 'Token is missing' });
    }
  
    jwt.verify(token, secretKey,(err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Token is invalid or expired' });
      }
  
      req.userId = decoded.email;
  
      next();
    });
  };
module.exports=validateToken
