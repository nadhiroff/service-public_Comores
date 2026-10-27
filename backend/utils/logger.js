const pool = require("../config/db");

async function logActivity(utilisateurId, action, details = "", niveau = "info") {
  try {
    await pool.query(
      "INSERT INTO journaux_activite (utilisateur_id, action, details, niveau) VALUES (?, ?, ?, ?)",
      [utilisateurId || null, action, details, niveau]
    );
  } catch (err) {
    console.error("Erreur de journalisation :", err.message);
  }
}

module.exports = { logActivity };
