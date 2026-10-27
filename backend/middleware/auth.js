const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const header = req.headers["authorization"];
  const token = header && header.startsWith("Bearer ") ? header.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ message: "Authentification requise." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role, service_id, email }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Session invalide ou expirée." });
  }
}

// roles: liste des rôles autorisés, ex: requireRole("super_admin", "admin_service")
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Accès refusé : privilèges insuffisants." });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };
