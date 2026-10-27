const pool = require("./config/db");

async function createMissingTables() {
  try {
    console.log("Création des tables manquantes...");
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS maintenance_historique (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT NOT NULL,
        action ENUM('active', 'desactive') NOT NULL,
        message TEXT,
        cree_le DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES utilisateurs(id)
      )
    `);
    console.log("Table maintenance_historique créée avec succès");
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS emails_masse_historique (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT NOT NULL,
        sujet VARCHAR(255) NOT NULL,
        contenu TEXT NOT NULL,
        destinataires_count INT DEFAULT 0,
        cree_le DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES utilisateurs(id)
      )
    `);
    console.log("Table emails_masse_historique créée avec succès");
    
    console.log("Tables créées avec succès !");
    process.exit(0);
  } catch (error) {
    console.error("Erreur lors de la création des tables:", error);
    process.exit(1);
  }
}

createMissingTables();
