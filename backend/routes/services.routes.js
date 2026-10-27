const router = require("express").Router();
const { listCategories, searchServices, getServiceByCode } = require("../controllers/services.controller");

router.get("/", listCategories);
router.get("/search", searchServices);
router.get("/:code", getServiceByCode);

module.exports = router;
