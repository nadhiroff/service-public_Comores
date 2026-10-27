// Crée (ou met à jour) le compte Super Admin avec un mot de passe fourni en argument.
// Utilisation : npm run seed:admin -- "MonMotDePasseFort123!"
require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("../config/db");

async function run() {
  const password = process.argv[2];
  if (!password || password.length < 8) {
    console.error("Veuillez fournir un mot de passe d'au moins 8 caractères en argument.");
    console.error('Exemple : npm run seed:admin -- "MonMotDePasseFort123!"');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  const email = "superadmin@service-public.km";

  const [existing] = await pool.query("SELECT id FROM utilisateurs WHERE email = ?", [email]);

  if (existing.length) {
    await pool.query("UPDATE utilisateurs SET mot_de_passe_hash = ? WHERE email = ?", [hash, email]);
    console.log(`Mot de passe du Super Admin (${email}) mis à jour.`);
  } else {
    await pool.query(
      "INSERT INTO utilisateurs (nom, prenom, email, telephone, mot_de_passe_hash, role_id) VALUES (?, ?, ?, ?, ?, 3)",
      ["Admin", "Super", email, "+2693000000", hash]
    );
    console.log(`Compte Super Admin créé : ${email}`);
  }
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
