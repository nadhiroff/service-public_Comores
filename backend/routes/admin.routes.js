const router = require("express").Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const admin = require("../controllers/admin.controller");

// ---------- Super Admin uniquement ----------
router.get("/stats", verifyToken, requireRole("super_admin"), admin.dashboardStats);
router.get("/utilisateurs", verifyToken, requireRole("super_admin"), admin.listUsers);
router.patch("/utilisateurs/:id/toggle", verifyToken, requireRole("super_admin"), admin.toggleUser);
router.delete("/utilisateurs/:id", verifyToken, requireRole("super_admin"), admin.deleteUser);
router.post("/admins-service", verifyToken, requireRole("super_admin"), admin.createServiceAdmin);
router.patch("/services/:id/toggle", verifyToken, requireRole("super_admin"), admin.toggleService);
router.get("/maintenance", verifyToken, requireRole("super_admin"), admin.getMaintenance);
router.post("/maintenance", verifyToken, requireRole("super_admin"), admin.setMaintenance);
router.post("/broadcast-email", verifyToken, requireRole("super_admin"), admin.broadcastEmail);
router.get("/logs", verifyToken, requireRole("super_admin"), admin.getLogs);
router.get("/maintenance-historique", verifyToken, requireRole("super_admin"), admin.getMaintenanceHistory);
router.delete("/maintenance-historique/:id", verifyToken, requireRole("super_admin"), admin.deleteMaintenanceHistory);
router.patch("/maintenance-historique/:id/toggle", verifyToken, requireRole("super_admin"), admin.toggleMaintenanceFromHistory);
router.get("/email-historique", verifyToken, requireRole("super_admin"), admin.getEmailHistory);
router.delete("/email-historique/:id", verifyToken, requireRole("super_admin"), admin.deleteEmailHistory);
router.post("/email-historique/:id/resend", verifyToken, requireRole("super_admin"), admin.resendEmailFromHistory);

// ---------- Admin de service ----------
router.get("/mes-demandes-service", verifyToken, requireRole("admin_service"), admin.serviceDemandes);

module.exports = router;
