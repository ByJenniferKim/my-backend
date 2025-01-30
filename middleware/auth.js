const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("Authorization");

  // Check if token is missing
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Remove "Bearer " from the token string if it's included
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    
    // Attach the decoded user data to the request
    req.user = decoded;
    next(); // Move to the next middleware or route handler
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
