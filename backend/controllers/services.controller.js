const pool = require("../config/db");

async function listCategories(req, res) {
  const [categories] = await pool.query("SELECT * FROM categories ORDER BY ordre");
  const [services] = await pool.query("SELECT * FROM services WHERE actif = TRUE");

  const result = categories.map((cat) => ({
    ...cat,
    services: services.filter((s) => s.categorie_id === cat.id)
  }));

  res.json(result);
}

async function searchServices(req, res) {
  const q = (req.query.q || "").trim();
  if (!q) return res.json([]);

  const [rows] = await pool.query(
    `SELECT s.*, c.nom AS categorie_nom FROM services s
     JOIN categories c ON c.id = s.categorie_id
     WHERE s.actif = TRUE AND (s.nom LIKE ? OR s.description LIKE ?)
     LIMIT 20`,
    [`%${q}%`, `%${q}%`]
  );
  res.json(rows);
}

async function getServiceByCode(req, res) {
  const [rows] = await pool.query(
    `SELECT s.*, c.nom AS categorie_nom, c.code AS categorie_code FROM services s
     JOIN categories c ON c.id = s.categorie_id
     WHERE s.code = ?`,
    [req.params.code]
  );
  if (!rows.length) return res.status(404).json({ message: "Service introuvable." });
  if (!rows[0].actif) return res.status(503).json({ message: "Ce service est temporairement indisponible." });
  res.json(rows[0]);
}

module.exports = { listCategories, searchServices, getServiceByCode };
