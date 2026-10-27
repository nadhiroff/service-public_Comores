const pool = require("../config/db");
const { logActivity } = require("../utils/logger");
const { sendMail } = require("../utils/mailer");

function generateTrackingNumber() {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `KM-${year}-${rand}`;
}

// Citoyen : créer une nouvelle demande (avec pièces jointes éventuelles)
async function createDemande(req, res) {
  const conn = await pool.getConnection();
  try {
    const { service_code, donnees_formulaire } = req.body;
    const [services] = await conn.query("SELECT * FROM services WHERE code = ? AND actif = TRUE", [service_code]);
    if (!services.length) {
      return res.status(404).json({ message: "Service introuvable ou indisponible." });
    }
    const service = services[0];
    const numero = generateTrackingNumber();

    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO demandes (numero_suivi, utilisateur_id, service_id, statut, donnees_formulaire)
       VALUES (?, ?, ?, 'recue', ?)`,
      [numero, req.user.id, service.id, donnees_formulaire ? JSON.stringify(JSON.parse(donnees_formulaire)) : null]
    );
    const demandeId = result.insertId;

    await conn.query(
      "INSERT INTO demande_historique (demande_id, statut, commentaire) VALUES (?, 'recue', 'Dossier déposé par l''usager')",
      [demandeId]
    );

    if (req.files && req.files.length) {
      for (const file of req.files) {
        await conn.query(
          `INSERT INTO documents (demande_id, nom_original, chemin_fichier, type_mime, taille_octets)
           VALUES (?, ?, ?, ?, ?)`,
          [demandeId, file.originalname, file.filename, file.mimetype, file.size]
        );
      }
    }

    await conn.commit();

    await logActivity(req.user.id, "Dépôt de demande", `${numero} — ${service.nom}`);
    await sendMail({
      to: req.user.email,
      subject: `Confirmation de dépôt — ${numero}`,
      html: `<p>Votre demande pour le service « ${service.nom} » a bien été enregistrée.</p>
             <p>Numéro de suivi : <strong>${numero}</strong></p>`
    });

    res.status(201).json({ message: "Demande enregistrée avec succès.", numero_suivi: numero, demande_id: demandeId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors du dépôt de la demande." });
  } finally {
    conn.release();
  }
}

// Citoyen : liste de ses propres demandes
async function myDemandes(req, res) {
  const [rows] = await pool.query(
    `SELECT d.id, d.numero_suivi, d.statut, d.cree_le, d.maj_le, s.nom AS service_nom, s.code AS service_code
     FROM demandes d JOIN services s ON s.id = d.service_id
     WHERE d.utilisateur_id = ? ORDER BY d.cree_le DESC`,
    [req.user.id]
  );
  res.json(rows);
}

// Suivi public par numéro de suivi (accessible sans compte, comme sur service-public.bj)
async function trackByNumber(req, res) {
  const { numero } = req.params;
  const [rows] = await pool.query(
    `SELECT d.numero_suivi, d.statut, d.cree_le, d.maj_le, s.nom AS service_nom
     FROM demandes d JOIN services s ON s.id = d.service_id
     WHERE d.numero_suivi = ?`,
    [numero]
  );
  if (!rows.length) return res.status(404).json({ message: "Aucune demande trouvée avec ce numéro." });

  const [historique] = await pool.query(
    `SELECT statut, commentaire, cree_le FROM demande_historique
     WHERE demande_id = (SELECT id FROM demandes WHERE numero_suivi = ?) ORDER BY cree_le ASC`,
    [numero]
  );

  res.json({ ...rows[0], historique });
}

// Détail complet d'une demande (citoyen propriétaire ou admin habilité)
async function getDemandeDetail(req, res) {
  const [rows] = await pool.query(
    `SELECT d.*, s.nom AS service_nom, s.code AS service_code, s.categorie_id,
     u.prenom AS utilisateur_prenom, u.nom AS utilisateur_nom
     FROM demandes d 
     JOIN services s ON s.id = d.service_id 
     JOIN utilisateurs u ON u.id = d.utilisateur_id
     WHERE d.id = ?`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ message: "Demande introuvable." });
  const demande = rows[0];

  const isOwner = demande.utilisateur_id === req.user.id;
  const isSuperAdmin = req.user.role === "super_admin";
  const isServiceAdmin = req.user.role === "admin_service" && req.user.service_id === demande.service_id;

  if (!isOwner && !isSuperAdmin && !isServiceAdmin) {
    return res.status(403).json({ message: "Accès non autorisé à cette demande." });
  }

  const [documents] = await pool.query("SELECT id, nom_original, chemin_fichier, type_mime, taille_octets, televerse_le FROM documents WHERE demande_id = ?", [demande.id]);
  const [historique] = await pool.query("SELECT statut, commentaire, cree_le FROM demande_historique WHERE demande_id = ? ORDER BY cree_le ASC", [demande.id]);
  const [messages] = await pool.query(
    `SELECT m.contenu, m.envoye_le, u.prenom, u.nom, r.nom as role
     FROM messages m JOIN utilisateurs u ON u.id = m.expediteur_id JOIN roles r ON r.id = u.role_id
     WHERE m.demande_id = ? ORDER BY m.envoye_le ASC`,
    [demande.id]
  );

  res.json({ ...demande, documents, historique, messages });
}

// Admin de service / Super admin : changer le statut d'une demande
async function updateStatus(req, res) {
  const { statut, commentaire } = req.body;
  const validStatuts = ["recue", "en_attente_pieces", "en_cours", "validee", "rejetee"];
  if (!validStatuts.includes(statut)) {
    return res.status(400).json({ message: "Statut invalide." });
  }
  if (statut === "rejetee" && !commentaire) {
    return res.status(400).json({ message: "Un motif est obligatoire en cas de rejet." });
  }

  const [rows] = await pool.query(
    `SELECT d.*, u.email, u.prenom, u.nom, s.nom as service_nom FROM demandes d
     JOIN utilisateurs u ON u.id = d.utilisateur_id
     JOIN services s ON s.id = d.service_id WHERE d.id = ?`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ message: "Demande introuvable." });
  const demande = rows[0];

  if (req.user.role === "admin_service" && req.user.service_id !== demande.service_id) {
    return res.status(403).json({ message: "Cette demande ne relève pas de votre service." });
  }

  await pool.query("UPDATE demandes SET statut = ?, motif_rejet = ? WHERE id = ?", [
    statut,
    statut === "rejetee" ? commentaire : null,
    demande.id
  ]);
  await pool.query("INSERT INTO demande_historique (demande_id, statut, commentaire) VALUES (?, ?, ?)", [
    demande.id,
    statut,
    commentaire || null
  ]);

  await logActivity(req.user.id, "Changement de statut", `Demande ${demande.numero_suivi} -> ${statut}`);
  
  const statutLabels = {
    'recue': 'Reçue',
    'en_attente_pieces': 'En attente de pièces',
    'en_cours': 'En cours d\'instruction',
    'validee': 'Validée',
    'rejetee': 'Rejetée'
  };
  
  await sendMail({
    to: demande.email,
    subject: `Mise à jour de votre demande ${demande.numero_suivi} - Service Public Comores`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2e7d32 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Service Public</h1>
          <p style="color: #ffd700; margin: 5px 0 0 0; font-size: 14px;">Union des Comores</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
          <h2 style="color: #1e3a5f; margin-top: 0;">Mise à jour de votre demande</h2>
          <p>Bonjour <strong>${demande.prenom} ${demande.nom}</strong>,</p>
          <p>Le statut de votre demande pour le service <strong>« ${demande.service_nom} »</strong> a été mis à jour.</p>
          
          <div style="background: white; padding: 15px; border-left: 4px solid #2e7d32; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px;"><strong>Numéro de suivi :</strong> ${demande.numero_suivi}</p>
            <p style="margin: 10px 0 0 0; font-size: 14px;"><strong>Nouveau statut :</strong> <span style="color: #2e7d32; font-weight: bold;">${statutLabels[statut] || statut}</span></p>
          </div>
          
          ${commentaire ? `
          <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px;"><strong>Commentaire de l'administration :</strong></p>
            <p style="margin: 10px 0 0 0; font-size: 14px;">${commentaire}</p>
          </div>
          ` : ''}
          
          <p style="font-size: 14px; color: #666;">Vous pouvez suivre l'évolution de votre demande en vous connectant à votre espace citoyen ou en utilisant le numéro de suivi ci-dessus.</p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
            Cet email a été envoyé automatiquement par le portail national des services publics de l'Union des Comores.<br>
            Pour toute question, contactez le service concerné.
          </p>
        </div>
      </div>
    `
  });

  res.json({ message: "Statut mis à jour." });
}

// Message entre admin de service et usager (ou l'inverse)
async function addMessage(req, res) {
  const { contenu } = req.body;
  if (!contenu || !contenu.trim()) return res.status(400).json({ message: "Le message ne peut pas être vide." });

  const [rows] = await pool.query("SELECT * FROM demandes WHERE id = ?", [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: "Demande introuvable." });
  const demande = rows[0];

  const isOwner = demande.utilisateur_id === req.user.id;
  const isSuperAdmin = req.user.role === "super_admin";
  const isServiceAdmin = req.user.role === "admin_service" && req.user.service_id === demande.service_id;
  if (!isOwner && !isSuperAdmin && !isServiceAdmin) {
    return res.status(403).json({ message: "Accès non autorisé." });
  }

  await pool.query("INSERT INTO messages (demande_id, expediteur_id, contenu) VALUES (?, ?, ?)", [
    demande.id,
    req.user.id,
    contenu.trim()
  ]);

  res.status(201).json({ message: "Message envoyé." });
}

// Téléchargement de document
async function downloadDocument(req, res) {
  const { id } = req.params;
  const [rows] = await pool.query(
    `SELECT d.*, dem.utilisateur_id, dem.service_id, u.prenom, u.nom, dem.numero_suivi
     FROM documents d
     JOIN demandes dem ON dem.id = d.demande_id
     JOIN utilisateurs u ON u.id = dem.utilisateur_id
     WHERE d.id = ?`,
    [id]
  );
  
  if (!rows.length) return res.status(404).json({ message: "Document introuvable." });
  const doc = rows[0];

  const isOwner = doc.utilisateur_id === req.user.id;
  const isSuperAdmin = req.user.role === "super_admin";
  const isServiceAdmin = req.user.role === "admin_service" && req.user.service_id === doc.service_id;
  
  if (!isOwner && !isSuperAdmin && !isServiceAdmin) {
    return res.status(403).json({ message: "Accès non autorisé à ce document." });
  }

  const path = require("path");
  const fs = require("fs");
  const filePath = path.join(__dirname, "../uploads", doc.chemin_fichier);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Fichier introuvable sur le serveur." });
  }

  const extension = doc.nom_original.split('.').pop();
  const filename = `${doc.prenom}_${doc.nom}_${doc.numero_suivi}.${extension}`;
  
  res.download(filePath, filename);
}

module.exports = { createDemande, myDemandes, trackByNumber, getDemandeDetail, updateStatus, addMessage, downloadDocument };
