const router = require("express").Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  createDemande, myDemandes, trackByNumber, getDemandeDetail, updateStatus, addMessage, downloadDocument
} = require("../controllers/demandes.controller");

// Suivi public par numéro — pas d'authentification requise (comme service-public.bj)
router.get("/suivi/:numero", trackByNumber);

// Citoyen authentifié
router.post("/", verifyToken, requireRole("citoyen"), upload.array("pieces", 5), createDemande);
router.get("/mes-demandes", verifyToken, requireRole("citoyen"), myDemandes);
router.get("/:id", verifyToken, getDemandeDetail);
router.post("/:id/messages", verifyToken, addMessage);

// Documents
router.get("/documents/:id/download", verifyToken, downloadDocument);

// Admin de service / super admin
router.patch("/:id/statut", verifyToken, requireRole("admin_service", "super_admin"), updateStatus);

module.exports = router;
