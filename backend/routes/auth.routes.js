const router = require("express").Router();
const { register, login, me, forgotPassword } = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.get("/me", verifyToken, me);

module.exports = router;
