const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware to authenticate incoming requests using JWT
const authenticate = (req, res, next) => {
  // Check if the request contains an authorization header with a token
  const token = req.headers.authorization;

  if (token) {
    // Verify the token with your secret key
    jwt.verify(token, process.env.KEY, (err, decoded) => {
      if (err) {
        // Token verification failed (e.g., expired or tampered)
        res.status(401).json({ msg: "Invalid token, please login again" });
      } else {
        // Token is valid, extract the userID from the decoded payload
        const userID = decoded.userID;

        // Attach the userID to the request object for use in subsequent middleware/routes
        req.body.userID = userID;

        // Proceed to the next middleware/route
        next();
      }
    });
  } else {
    // No token provided in the request header
    res.status(401).json({ msg: "Authorization token required" });
  }
};

module.exports = { authenticate };
