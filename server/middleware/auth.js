const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Get token from header
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization header, access denied' });
  }

  // Token is usually "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid token format, authorization denied' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'school_facility_portal_secret_key_98765');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid, authorization denied' });
  }
};
