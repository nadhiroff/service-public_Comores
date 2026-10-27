const pool = require("./config/db");

async function checkMaintenanceHistory() {
  try {
    const [rows] = await pool.query("SELECT * FROM maintenance_historique ORDER BY cree_le DESC");
    console.log("Historique maintenance:", rows);
    
    const [paramRows] = await pool.query("SELECT cle, valeur FROM parametres WHERE cle IN ('maintenance_mode', 'maintenance_message')");
    console.log("Paramètres:", paramRows);
    
    process.exit(0);
  } catch (error) {
    console.error("Erreur:", error);
    process.exit(1);
  }
}

checkMaintenanceHistory();
