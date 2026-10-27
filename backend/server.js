require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const checkMaintenance = require("./middleware/maintenance");
const { verifyToken } = require("./middleware/auth");

const authRoutes = require("./routes/auth.routes");
const servicesRoutes = require("./routes/services.routes");
const demandesRoutes = require("./routes/demandes.routes");
const adminRoutes = require("./routes/admin.routes");
const paiementsRoutes = require("./routes/paiements.routes");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware optionnel pour peupler req.user si un token est présent,
// sans bloquer les routes publiques (utile pour checkMaintenance).
app.use((req, res, next) => {
  const header = req.headers["authorization"];
  if (!header) return next();
  try {
    const jwt = require("jsonwebtoken");
    req.user = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
  } catch (e) {
    // token invalide -> on laisse req.user vide, les routes protégées le géreront
  }
  next();
});

app.use(checkMaintenance);

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "service-public-km-backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/demandes", demandesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/paiements", paiementsRoutes);

// Gestion des erreurs Multer / génériques
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Erreur interne du serveur." });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Serveur service-public-km à l'écoute sur le port ${PORT}`);
});
