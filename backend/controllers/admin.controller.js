const pool = require("../config/db");
const { logActivity } = require("../utils/logger");
const { sendMail } = require("../utils/mailer");

// ---------- SUPER ADMIN ----------

async function dashboardStats(req, res) {
  const [[{ total_utilisateurs }]] = await pool.query("SELECT COUNT(*) AS total_utilisateurs FROM utilisateurs WHERE role_id = 1");
  const [[{ total_demandes }]] = await pool.query("SELECT COUNT(*) AS total_demandes FROM demandes");
  const [parStatut] = await pool.query("SELECT statut, COUNT(*) AS total FROM demandes GROUP BY statut");
  const [parService] = await pool.query(
    `SELECT s.nom, COUNT(d.id) AS total FROM services s LEFT JOIN demandes d ON d.service_id = s.id GROUP BY s.id ORDER BY total DESC`
  );
  res.json({ total_utilisateurs, total_demandes, parStatut, parService });
}

async function listUsers(req, res) {
  const [rows] = await pool.query(
    `SELECT u.id, u.nom, u.prenom, u.email, u.telephone, r.nom AS role, u.actif, u.cree_le
     FROM utilisateurs u JOIN roles r ON r.id = u.role_id ORDER BY u.cree_le DESC`
  );
  res.json(rows);
}

async function toggleUser(req, res) {
  const { id } = req.params;
  await pool.query("UPDATE utilisateurs SET actif = NOT actif WHERE id = ?", [id]);
  await logActivity(req.user.id, "Basculement statut utilisateur", `Utilisateur #${id}`);
  res.json({ message: "Statut de l'utilisateur mis à jour." });
}

async function deleteUser(req, res) {
  const { id } = req.params;
  await pool.query("DELETE FROM utilisateurs WHERE id = ?", [id]);
  await logActivity(req.user.id, "Suppression utilisateur", `Utilisateur #${id}`);
  res.json({ message: "Utilisateur supprimé." });
}

async function createServiceAdmin(req, res) {
  const bcrypt = require("bcryptjs");
  const { nom, prenom, email, mot_de_passe, service_id } = req.body;
  if (!nom || !prenom || !email || !mot_de_passe || !service_id) {
    return res.status(400).json({ message: "Tous les champs sont obligatoires." });
  }
  const hash = await bcrypt.hash(mot_de_passe, 10);
  await pool.query(
    "INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe_hash, role_id, service_id) VALUES (?, ?, ?, ?, 2, ?)",
    [nom, prenom, email, hash, service_id]
  );
  await logActivity(req.user.id, "Création admin de service", `${email} -> service #${service_id}`);
  res.status(201).json({ message: "Compte administrateur de service créé." });
}

async function toggleService(req, res) {
  const { id } = req.params;
  await pool.query("UPDATE services SET actif = NOT actif WHERE id = ?", [id]);
  await logActivity(req.user.id, "Basculement statut service", `Service #${id}`);
  res.json({ message: "Statut du service mis à jour." });
}

async function getMaintenance(req, res) {
  const [modeRows] = await pool.query("SELECT valeur FROM parametres WHERE cle = 'maintenance_mode'");
  const [msgRows] = await pool.query("SELECT valeur FROM parametres WHERE cle = 'maintenance_message'");
  const enabled = modeRows.length && modeRows[0].valeur === "true";
  res.json({ enabled, message: msgRows[0]?.valeur || "" });
}

async function setMaintenance(req, res) {
  const { enabled, message } = req.body;
  
  if (enabled) {
    // If activating maintenance, first deactivate any previous active entries
    await pool.query("UPDATE maintenance_historique SET action = 'desactive' WHERE action = 'active'");
  }
  
  await pool.query("UPDATE parametres SET valeur = ? WHERE cle = 'maintenance_mode'", [enabled ? "true" : "false"]);
  if (message) {
    await pool.query("UPDATE parametres SET valeur = ? WHERE cle = 'maintenance_message'", [message]);
  }
  await pool.query(
    "INSERT INTO maintenance_historique (admin_id, action, message) VALUES (?, ?, ?)",
    [req.user.id, enabled ? "active" : "desactive", message || ""]
  );
  await logActivity(req.user.id, "Mode maintenance", `enabled=${enabled}`);
  res.json({ message: "Paramètre de maintenance mis à jour." });
}

async function broadcastEmail(req, res) {
  const { sujet, contenu } = req.body;
  if (!sujet || !contenu) return res.status(400).json({ message: "Sujet et contenu requis." });

  const [users] = await pool.query("SELECT u.email, u.prenom, u.nom FROM utilisateurs u JOIN roles r ON r.id = u.role_id WHERE u.actif = TRUE AND r.nom = 'citoyen'");
  
  if (users.length === 0) {
    return res.status(400).json({ message: "Aucun citoyen actif trouvé." });
  }
  
  // Send emails to all users with delay to avoid spam detection
  let sentCount = 0;
  for (const u of users) {
    try {
      await sendMail({
        to: u.email,
        subject: sujet,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2e7d32 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Service Public</h1>
              <p style="color: #ffd700; margin: 5px 0 0 0; font-size: 14px;">Union des Comores</p>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
              <h2 style="color: #1e3a5f; margin-top: 0;">${sujet}</h2>
              <p>Bonjour <strong>${u.prenom} ${u.nom}</strong>,</p>
              <div style="margin: 20px 0; line-height: 1.6; color: #333;">
                ${contenu}
              </div>
              <div style="background: white; padding: 15px; border-left: 4px solid #2e7d32; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px;"><strong>📢 Information officielle</strong></p>
                <p style="margin: 10px 0 0 0; font-size: 14px;">Cet email a été envoyé par l'administration du portail national des services publics.</p>
              </div>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
                Cet email a été envoyé automatiquement par le portail national des services publics de l'Union des Comores.<br>
                Pour toute question, contactez le support technique.
              </p>
            </div>
          </div>
        `
      });
      sentCount++;
      
      // Add delay between emails to avoid spam detection (2 seconds)
      if (sentCount < users.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error("Error sending email to:", u.email, error);
    }
  }
  
  await pool.query(
    "INSERT INTO emails_masse_historique (admin_id, sujet, contenu, destinataires_count) VALUES (?, ?, ?, ?)",
    [req.user.id, sujet, contenu, sentCount]
  );
  await logActivity(req.user.id, "Campagne email", `${sujet} -> ${sentCount} destinataires`);
  res.json({ message: `Email envoyé à ${sentCount} usager(s).` });
}

async function getLogs(req, res) {
  const [rows] = await pool.query(
    `SELECT j.*, u.email FROM journaux_activite j LEFT JOIN utilisateurs u ON u.id = j.utilisateur_id
     ORDER BY j.cree_le DESC LIMIT 200`
  );
  res.json(rows);
}

async function getMaintenanceHistory(req, res) {
  const [rows] = await pool.query(
    `SELECT mh.*, u.prenom, u.nom FROM maintenance_historique mh 
     JOIN utilisateurs u ON u.id = mh.admin_id 
     ORDER BY mh.cree_le DESC LIMIT 50`
  );
  res.json(rows);
}

async function deleteMaintenanceHistory(req, res) {
  const { id } = req.params;
  await pool.query("DELETE FROM maintenance_historique WHERE id = ?", [id]);
  await logActivity(req.user.id, "Suppression historique maintenance", `Historique #${id}`);
  res.json({ message: "Historique de maintenance supprimé." });
}

async function toggleMaintenanceFromHistory(req, res) {
  const { id } = req.params;
  
  // Get the history entry
  const [rows] = await pool.query("SELECT * FROM maintenance_historique WHERE id = ?", [id]);
  if (!rows.length) {
    return res.status(404).json({ message: "Historique introuvable." });
  }
  
  const historyEntry = rows[0];
  const newAction = historyEntry.action === 'active' ? 'desactive' : 'active';
  
  // Deactivate all other active entries if we're activating this one
  if (newAction === 'active') {
    await pool.query("UPDATE maintenance_historique SET action = 'desactive' WHERE action = 'active'");
  }
  
  // Update the history entry
  await pool.query("UPDATE maintenance_historique SET action = ? WHERE id = ?", [newAction, id]);
  
  // Update the maintenance mode parameter
  const maintenanceEnabled = newAction === 'active';
  await pool.query("UPDATE parametres SET valeur = ? WHERE cle = 'maintenance_mode'", [maintenanceEnabled ? "true" : "false"]);
  
  // Update the maintenance message if activating
  if (maintenanceEnabled && historyEntry.message) {
    await pool.query("UPDATE parametres SET valeur = ? WHERE cle = 'maintenance_message'", [historyEntry.message]);
  }
  
  await logActivity(req.user.id, "Toggle maintenance depuis historique", `Historique #${id} -> ${newAction}`);
  res.json({ message: "Maintenance mise à jour depuis l'historique.", enabled: maintenanceEnabled });
}

async function getEmailHistory(req, res) {
  const [rows] = await pool.query(
    `SELECT emh.*, u.prenom, u.nom FROM emails_masse_historique emh 
     JOIN utilisateurs u ON u.id = emh.admin_id 
     ORDER BY emh.cree_le DESC LIMIT 50`
  );
  res.json(rows);
}

async function deleteEmailHistory(req, res) {
  const { id } = req.params;
  await pool.query("DELETE FROM emails_masse_historique WHERE id = ?", [id]);
  await logActivity(req.user.id, "Suppression historique email", `Historique #${id}`);
  res.json({ message: "Historique d'email supprimé." });
}

async function resendEmailFromHistory(req, res) {
  const { id } = req.params;
  
  console.log("Resend email request for history ID:", id);
  
  // Get the history entry
  const [rows] = await pool.query("SELECT * FROM emails_masse_historique WHERE id = ?", [id]);
  if (!rows.length) {
    console.log("History entry not found");
    return res.status(404).json({ message: "Historique introuvable." });
  }
  
  const historyEntry = rows[0];
  console.log("History entry found:", historyEntry);
  
  // Get all active users with role 'citoyen'
  const [users] = await pool.query("SELECT u.email, u.prenom, u.nom FROM utilisateurs u JOIN roles r ON r.id = u.role_id WHERE u.actif = TRUE AND r.nom = 'citoyen'");
  console.log("Active citizens found:", users.length);
  
  if (users.length === 0) {
    console.log("No active citizens found");
    return res.status(400).json({ message: "Aucun citoyen actif trouvé." });
  }
  
  // Send emails to all users with delay to avoid spam detection
  let sentCount = 0;
  for (const u of users) {
    try {
      console.log("Sending email to:", u.email);
      await sendMail({
        to: u.email,
        subject: historyEntry.sujet,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2e7d32 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Service Public</h1>
              <p style="color: #ffd700; margin: 5px 0 0 0; font-size: 14px;">Union des Comores</p>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
              <h2 style="color: #1e3a5f; margin-top: 0;">${historyEntry.sujet}</h2>
              <p>Bonjour <strong>${u.prenom} ${u.nom}</strong>,</p>
              <div style="margin: 20px 0; line-height: 1.6; color: #333;">
                ${historyEntry.contenu}
              </div>
              <div style="background: white; padding: 15px; border-left: 4px solid #2e7d32; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px;"><strong>📢 Information officielle</strong></p>
                <p style="margin: 10px 0 0 0; font-size: 14px;">Cet email a été envoyé par l'administration du portail national des services publics.</p>
              </div>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
                Cet email a été envoyé automatiquement par le portail national des services publics de l'Union des Comores.<br>
                Pour toute question, contactez le support technique.
              </p>
            </div>
          </div>
        `
      });
      sentCount++;
      console.log("Email sent successfully to:", u.email);
      
      // Add delay between emails to avoid spam detection (2 seconds)
      if (sentCount < users.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error("Error sending email to:", u.email, error);
    }
  }
  
  console.log("Total emails sent:", sentCount);
  await logActivity(req.user.id, "Renvoi email depuis historique", `Historique #${id} -> ${sentCount} destinataires`);
  res.json({ message: `Email renvoyé à ${sentCount} usager(s).` });
}

// ---------- ADMIN DE SERVICE ----------

async function serviceDemandes(req, res) {
  const [rows] = await pool.query(
    `SELECT d.id, d.numero_suivi, d.statut, d.cree_le, d.maj_le, u.nom, u.prenom, u.email
     FROM demandes d JOIN utilisateurs u ON u.id = d.utilisateur_id
     WHERE d.service_id = ? ORDER BY d.cree_le DESC`,
    [req.user.service_id]
  );
  res.json(rows);
}

module.exports = {
  dashboardStats, listUsers, toggleUser, deleteUser, createServiceAdmin,
  toggleService, getMaintenance, setMaintenance, broadcastEmail, getLogs, serviceDemandes,
  getMaintenanceHistory, deleteMaintenanceHistory, toggleMaintenanceFromHistory,
  getEmailHistory, deleteEmailHistory, resendEmailFromHistory
};
