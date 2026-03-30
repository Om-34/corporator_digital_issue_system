const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Verify that the Authorization header exists and uses the Bearer scheme
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 2. Verify the token using your environment's secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    /**
     * req.user will now contain:
     * { userId, officeId, role, name, iat, exp }
     */
    req.user = decoded; 

    // 🛡️ MASTER ADMIN BYPASS
    // Most routes filter by officeId. If a user has no officeId AND is not a SUPER_ADMIN,
    // we block them here to prevent data leakage.
    if (!req.user.officeId && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: "Access Denied: No office assigned to this account." });
    }
    
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};