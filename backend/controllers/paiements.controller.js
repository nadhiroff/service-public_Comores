const pool = require("../config/db");
const { logActivity } = require("../utils/logger");

/**
 * NOTE IMPORTANTE
 * ----------------
 * Cette implémentation est un "stub" fonctionnel : elle enregistre la tentative
 * de paiement en base et simule une confirmation, pour que le parcours complet
 * (dépôt -> paiement -> suivi) soit testable de bout en bout sans clés API réelles.
 *
 * Pour la mise en production, remplacer le bloc "SIMULATION" ci-dessous par un
 * appel réel à la passerelle choisie :
 *   - FedaPay   : https://docs.fedapay.com
 *   - Mobicash / HolodiMoney : API/webhook fournis par l'opérateur comorien
 * et valider la transaction via le webhook du fournisseur avant de marquer
 * le paiement comme "reussi".
 */
async function initierPaiement(req, res) {
  const { demande_id, montant, moyen_paiement } = req.body;
  if (!demande_id || !montant || !moyen_paiement) {
    return res.status(400).json({ message: "demande_id, montant et moyen_paiement sont requis." });
  }

  const [demandes] = await pool.query("SELECT * FROM demandes WHERE id = ? AND utilisateur_id = ?", [demande_id, req.user.id]);
  if (!demandes.length) return res.status(404).json({ message: "Demande introuvable." });

  const reference = `PAY-${Date.now()}`;

  const [result] = await pool.query(
    `INSERT INTO paiements (demande_id, montant, moyen_paiement, reference_transaction, statut)
     VALUES (?, ?, ?, ?, 'en_attente')`,
    [demande_id, montant, moyen_paiement, reference]
  );

  // ---- SIMULATION : à remplacer par l'appel réel à la passerelle ----
  await pool.query("UPDATE paiements SET statut = 'reussi' WHERE id = ?", [result.insertId]);
  // --------------------------------------------------------------------

  await logActivity(req.user.id, "Paiement initié", `${reference} — ${montant} KMF via ${moyen_paiement}`);

  res.status(201).json({
    message: "Paiement enregistré (mode simulation — à connecter à une vraie passerelle en production).",
    reference_transaction: reference
  });
}

async function historiquePaiements(req, res) {
  const [rows] = await pool.query(
    `SELECT p.* FROM paiements p JOIN demandes d ON d.id = p.demande_id WHERE d.utilisateur_id = ? ORDER BY p.cree_le DESC`,
    [req.user.id]
  );
  res.json(rows);
}

module.exports = { initierPaiement, historiquePaiements };
