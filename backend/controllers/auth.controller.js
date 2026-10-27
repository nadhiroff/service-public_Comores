const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { logActivity } = require("../utils/logger");
const { sendMail } = require("../utils/mailer");

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role_nom,
      service_id: user.service_id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );
}

async function register(req, res) {
  try {
    const { nom, prenom, type_identite, numero_identite, email, telephone, mot_de_passe } = req.body;
    if (!nom || !prenom || !type_identite || !numero_identite || !email || !mot_de_passe) {
      return res.status(400).json({ message: "Tous les champs obligatoires doivent être renseignés." });
    }
    if (mot_de_passe.length < 8) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères." });
    }

    // Check for duplicate email
    const [existingEmail] = await pool.query("SELECT id FROM utilisateurs WHERE email = ?", [email]);
    if (existingEmail.length) {
      return res.status(409).json({ field: "email", message: "Cet email est déjà utilisé." });
    }

    // Check for duplicate identity number
    const [existingIdentity] = await pool.query("SELECT id FROM utilisateurs WHERE numero_identite = ?", [numero_identite]);
    if (existingIdentity.length) {
      return res.status(409).json({ field: "numero_identite", message: "Ce numéro d'identité est déjà utilisé." });
    }

    const hash = await bcrypt.hash(mot_de_passe, 10);
    const [result] = await pool.query(
      "INSERT INTO utilisateurs (nom, prenom, type_identite, numero_identite, email, telephone, mot_de_passe_hash, role_id) VALUES (?, ?, ?, ?, ?, ?, ?, 1)",
      [nom, prenom, type_identite, numero_identite, email, telephone || null, hash]
    );

    await logActivity(result.insertId, "Inscription", `Nouveau compte citoyen : ${email}`);
    await sendMail({
      to: email,
      subject: "Bienvenue sur le portail national des services publics - Union des Comores",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2e7d32 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Service Public</h1>
            <p style="color: #ffd700; margin: 5px 0 0 0; font-size: 14px;">Union des Comores</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <h2 style="color: #1e3a5f; margin-top: 0;">Bienvenue ${prenom} !</h2>
            <p>Nous sommes ravis de vous accueillir sur le portail national des services publics de l'Union des Comores.</p>

            <div style="background: white; padding: 15px; border-left: 4px solid #2e7d32; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px;"><strong>Votre compte a été créé avec succès</strong></p>
              <p style="margin: 10px 0 0 0; font-size: 14px;">Email : ${email}</p>
            </div>

            <p style="font-size: 14px;">Vous pouvez maintenant vous connecter pour accéder à tous les services publics en ligne :</p>
            <ul style="font-size: 14px; color: #666;">
              <li>État civil (actes de naissance, mariage, décès)</li>
              <li>Pièces d'identité (CNI, passeport)</li>
              <li>Visa et immigration</li>
              <li>Entreprises et commerce</li>
              <li>Fiscalité</li>
              <li>Et bien plus encore...</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/connexion" style="background: #2e7d32; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Me connecter</a>
            </div>

            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

            <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
              Cet email a été envoyé automatiquement par le portail national des services publics de l'Union des Comores.<br>
              Si vous n'avez pas créé de compte, ignorez cet email.
            </p>
          </div>
        </div>
      `
    });

    return res.status(201).json({ message: "Compte créé avec succès. Vous pouvez maintenant vous connecter." });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      // Handle duplicate entry error from database
      if (err.message.includes('email')) {
        return res.status(409).json({ field: "email", message: "Cet email est déjà utilisé." });
      } else if (err.message.includes('numero_identite')) {
        return res.status(409).json({ field: "numero_identite", message: "Ce numéro d'identité est déjà utilisé." });
      }
    }
    return res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
  }
}

async function login(req, res) {
  try {
    const { email, mot_de_passe } = req.body;
    if (!email || !mot_de_passe) {
      return res.status(400).json({ message: "Email et mot de passe requis." });
    }

    const [rows] = await pool.query(
      `SELECT u.*, r.nom AS role_nom FROM utilisateurs u
       JOIN roles r ON r.id = u.role_id
       WHERE u.email = ?`,
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    const user = rows[0];
    if (!user.actif) {
      return res.status(403).json({ message: "Ce compte a été désactivé. Contactez l'administration." });
    }

    const match = await bcrypt.compare(mot_de_passe, user.mot_de_passe_hash);
    if (!match) {
      await logActivity(user.id, "Échec de connexion", email, "avertissement");
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    // Check maintenance mode - only admins can login when maintenance is active
    const [maintenanceRows] = await pool.query(
      "SELECT valeur FROM parametres WHERE cle = 'maintenance_mode'"
    );
    const maintenanceEnabled = maintenanceRows.length && maintenanceRows[0].valeur === "true";
    
    console.log("Maintenance check during login:", { maintenanceEnabled, userRole: user.role_nom, maintenanceValue: maintenanceRows[0]?.valeur });
    
    if (maintenanceEnabled && user.role_nom !== "super_admin" && user.role_nom !== "admin_service") {
      const [msgRows] = await pool.query(
        "SELECT valeur FROM parametres WHERE cle = 'maintenance_message'"
      );
      console.log("Blocking citizen login due to maintenance");
      return res.status(503).json({
        maintenance: true,
        message: msgRows[0]?.valeur || "Le portail est en maintenance. Seuls les administrateurs peuvent se connecter."
      });
    }

    const token = signToken(user);
    await logActivity(user.id, "Connexion réussie", email);

    return res.json({
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role_nom,
        service_id: user.service_id
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur lors de la connexion." });
  }
}

async function me(req, res) {
  const [rows] = await pool.query(
    `SELECT u.id, u.nom, u.prenom, u.email, u.telephone, r.nom AS role, u.service_id
     FROM utilisateurs u JOIN roles r ON r.id = u.role_id WHERE u.id = ?`,
    [req.user.id]
  );
  if (!rows.length) return res.status(404).json({ message: "Utilisateur introuvable." });
  res.json(rows[0]);
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email requis." });
    }

    const [rows] = await pool.query("SELECT * FROM utilisateurs WHERE email = ?", [email]);
    
    if (rows.length) {
      const user = rows[0];
      const resetToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      
      await sendMail({
        to: email,
        subject: "Réinitialisation de votre mot de passe - Service Public Comores",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2e7d32 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Service Public</h1>
              <p style="color: #ffd700; margin: 5px 0 0 0; font-size: 14px;">Union des Comores</p>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
              <h2 style="color: #1e3a5f; margin-top: 0;">Réinitialisation de votre mot de passe</h2>
              <p>Bonjour <strong>${user.prenom} ${user.nom}</strong>,</p>
              <p>Vous avez demandé la réinitialisation de votre mot de passe sur le portail national des services publics de l'Union des Comores.</p>
              
              <div style="background: white; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px;"><strong>⚠️ Sécurité importante :</strong></p>
                <p style="margin: 10px 0 0 0; font-size: 14px;">Ce lien expire dans 1 heure pour des raisons de sécurité.</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}" style="background: #2e7d32; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">Réinitialiser mon mot de passe</a>
              </div>
              
              <p style="font-size: 14px; color: #666;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre compte reste sécurisé.</p>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
                Cet email a été envoyé automatiquement par le portail national des services publics de l'Union des Comores.<br>
                Pour toute question, contactez le support technique.
              </p>
            </div>
          </div>
        `
      });
    }

    return res.json({ message: "Si cet email existe, vous recevrez un lien de réinitialisation." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur lors de la demande de réinitialisation." });
  }
}

module.exports = { register, login, me, forgotPassword };
