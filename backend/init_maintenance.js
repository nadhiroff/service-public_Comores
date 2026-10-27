const pool = require("./config/db");

async function initMaintenance() {
  try {
    await pool.query(`
      INSERT INTO parametres (cle, valeur) 
      VALUES ('maintenance_mode', 'false'), ('maintenance_message', 'Le portail est en maintenance. Seuls les administrateurs peuvent se connecter.')
      ON DUPLICATE KEY UPDATE valeur = VALUES(valeur)
    `);
    console.log("Paramètres de maintenance initialisés avec succès");
    
    const [rows] = await pool.query("SELECT cle, valeur FROM parametres WHERE cle IN ('maintenance_mode', 'maintenance_message')");
    console.log("Paramètres actuels:", rows);
    process.exit(0);
  } catch (error) {
    console.error("Erreur:", error);
    process.exit(1);
  }
}

initMaintenance();
