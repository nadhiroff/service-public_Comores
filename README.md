# service-public.km — Portail national des services publics de l'Union des Comores

Ce dépôt contient le socle applicatif fonctionnel du portail : back-office, espace
citoyen, catalogue de services piloté par la base de données, suivi de demandes,
dépôt de pièces jointes et paiement en ligne (en mode simulation, prêt à être
connecté à une vraie passerelle).

> Ce livrable est un socle **fonctionnel et exécutable en local**, construit à
> partir du cahier des charges. Les 16 services du catalogue sont déjà
> configurés en base — de nouveaux services peuvent être ajoutés uniquement en
> ajoutant une ligne SQL, sans toucher au code.

## Structure du dépôt

```
service-public-km/
├── backend/     API Node.js / Express / MySQL (JWT, upload, paiement, emails)
└── frontend/    Application React / TypeScript / Tailwind CSS
```

## 1. Prérequis

- Node.js 18+ et npm
- MySQL 8 (ou MariaDB 10.6+)

## 2. Installation de la base de données

```bash
mysql -u root -p < backend/sql/schema.sql
```

Cela crée la base `service_public_km`, les tables, les 8 catégories et les
16 services du catalogue (état civil, CNI/passeport, e-Visa, entreprises/RCCM,
fiscalité, marchés publics, justice, certificat de résidence, permis de conduire).

## 3. Backend

```bash
cd backend
cp .env.example .env
# renseigner DB_USER, DB_PASSWORD, JWT_SECRET dans .env
npm install
npm run seed:admin -- "VotreMotDePasseFort123!"   # crée le compte Super Admin
npm run dev                                        # démarre sur http://localhost:4000
```

Compte Super Admin créé : `superadmin@service-public.km` / le mot de passe fourni.

### Créer un compte Admin de service

Une fois connecté en Super Admin, utilisez l'endpoint
`POST /api/admin/admins-service` (ou une future page dédiée du back-office) avec :

```json
{ "nom": "...", "prenom": "...", "email": "...", "mot_de_passe": "...", "service_id": 4 }
```

`service_id` correspond à l'identifiant du service dans la table `services`
(ex. 4 = Carte Nationale d'Identité). Un Admin de service ne voit et ne traite
que les demandes liées à son `service_id`.

## 4. Frontend

```bash
cd frontend
cp .env.example .env     # VITE_API_URL doit pointer vers le backend
npm install
npm run dev               # démarre sur http://localhost:5173
```

## 5. Parcours à tester

1. Créer un compte citoyen (`/inscription`), se connecter.
2. Parcourir un service (ex. Carte Nationale d'Identité), cliquer sur
   « Faire une demande en ligne », joindre une pièce, choisir un moyen de
   paiement (simulation) et envoyer.
3. Noter le numéro de suivi affiché, le tester sur `/suivi` sans être connecté.
4. Se connecter en Super Admin pour activer/désactiver un service, passer le
   site en maintenance, ou envoyer un email de masse.
5. Créer un compte Admin de service (via l'API, voir ci-dessus), s'y connecter,
   traiter la demande (changer son statut, répondre au citoyen).

## 6. Ce qui est fonctionnel dès maintenant

- Authentification JWT avec 3 rôles (citoyen, admin_service, super_admin)
- Catalogue de services piloté à 100% par la base de données (16 services actifs)
- Recherche de services, fiche détaillée (coût, durée, pièces, institution)
- Dépôt de demande avec upload de pièces (PDF/JPG/PNG, stockage serveur)
- Numéro de suivi unique + page de suivi publique sans compte
- Historique des statuts + messagerie citoyen ↔ administration
- Paiement en ligne (mode simulation — voir section 7)
- Back-office Super Admin : statistiques, gestion des usagers, activation/
  désactivation de service, mode maintenance, email de masse, journaux d'activité
- Back-office Admin de service : liste et traitement des demandes de son service
- Emails transactionnels (confirmation, changement de statut) — journalisés en
  console si aucun SMTP n'est configuré

## 7. Ce qui reste à brancher pour la production

- **Paiement réel** : remplacer le bloc de simulation dans
  `backend/controllers/paiements.controller.js` par les appels réels à
  Mobicash / HolodiMoney / FedaPay, avec validation par webhook.
- **SMTP réel** : renseigner `SMTP_*` dans `backend/.env` (actuellement les
  emails sont journalisés en console en développement).
- **Stockage cloud** : les documents sont actuellement stockés sur le disque du
  serveur (`backend/uploads/`) ; pour la production, prévoir un bucket S3 ou
  équivalent avec chiffrement au repos.
- **Application mobile** : ce socle expose une API REST déjà consommable par une
  application React Native (à développer en réutilisant les endpoints
  `/api/*` existants).
- **Textes légaux** : mentions légales, politique de confidentialité, à
  rédiger avec les autorités comoriennes compétentes.

## 8. Sécurité

- Mots de passe hashés (bcrypt)
- JWT avec expiration configurable
- Contrôle d'accès par rôle sur toutes les routes sensibles
- Validation des types de fichiers et limite de taille à l'upload
- Journalisation des actions sensibles (connexions, changements de statut,
  actions Super Admin) dans la table `journaux_activite`

Avant mise en production : ajouter HTTPS (reverse proxy Nginx + certificat
TLS), une limitation de débit (rate limiting) sur `/api/auth/login`, et un
audit de sécurité indépendant.
# service-public_Comores
