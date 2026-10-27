const pool = require("./config/db");

async function checkEmailHistory() {
  try {
    const [rows] = await pool.query("SELECT * FROM emails_masse_historique ORDER BY cree_le DESC");
    console.log("Historique email:", rows);
    
    const [userRows] = await pool.query("SELECT id, email, prenom, nom, role_id, actif FROM utilisateurs WHERE role_id = 1 AND actif = TRUE");
    console.log("Utilisateurs citoyens actifs:", userRows);
    
    process.exit(0);
  } catch (error) {
    console.error("Erreur:", error);
    process.exit(1);
  }
}

checkEmailHistory();
