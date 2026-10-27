const router = require("express").Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const { initierPaiement, historiquePaiements } = require("../controllers/paiements.controller");

router.post("/", verifyToken, requireRole("citoyen"), initierPaiement);
router.get("/", verifyToken, requireRole("citoyen"), historiquePaiements);

module.exports = router;
