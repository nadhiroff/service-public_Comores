const pool = require("./config/db");

async function checkMaintenance() {
  try {
    const [rows] = await pool.query("SELECT cle, valeur FROM parametres WHERE cle = 'maintenance_mode'");
    console.log("Maintenance mode setting:", rows);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkMaintenance();
