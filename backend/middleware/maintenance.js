const pool = require("../config/db");

// Bloque l'accès public si le mode maintenance est activé par le Super Admin.
// Les admins (JWT valide avec rôle admin) peuvent continuer à travailler.
async function checkMaintenance(req, res, next) {
  try {
    // Skip maintenance check for login route - it will be handled in the auth controller
    if (req.path === "/api/auth/login") {
      return next();
    }

    // Allow admins to access all routes when maintenance is active
    if (req.user && (req.user.role === "super_admin" || req.user.role === "admin_service")) {
      return next();
    }

    const [rows] = await pool.query(
      "SELECT valeur FROM parametres WHERE cle = 'maintenance_mode'"
    );
    const enabled = rows.length && rows[0].valeur === "true";

    if (enabled) {
      const [msgRows] = await pool.query(
        "SELECT valeur FROM parametres WHERE cle = 'maintenance_message'"
      );
      return res.status(503).json({
        maintenance: true,
        message: msgRows[0]?.valeur || "Le portail est en maintenance. Seuls les administrateurs peuvent se connecter."
      });
    }
    next();
  } catch (err) {
    next(); // en cas d'erreur de lecture, on n'empêche pas le service
  }
}

module.exports = checkMaintenance;
