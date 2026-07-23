# Analyse de l'Architecture — LuminaView (Monorepo)

## Vue d'ensemble
Monorepo regroupant **1 backend API** et **4 frontends React**, orchestrés par Docker Compose autour d'une **seule base MongoDB** (`luminaview_core`) et d'un dossier d'uploads partagé.

## 1. Backend — `backend/` (API centrale)
- **Stack** : Node.js / Express / TypeScript / Mongoose (v4.2, mai 2026)
- **Pattern classique MVC léger** : `models/` → `routes/` → `controllers/`
- **Routes montées** (`backend/src/server.ts:97-110`) :
  - Auth, Albums, Photos, Admin, Users, Reports, User-Pages, Comments
  - Chambre Noire mutualisée : Films, Gears, Projects, Blog
- **Sécurité intégrée** (`backend/src/server.ts:43-69`) : `helmet`, `hpp`, `express-mongo-sanitize`, et deux rate-limiters (auth 20 req/15min, API 200 req/15min)
- **Uploads** : `multer` + `sharp` (redimensionnement) + `exifr` (EXIF), servis en statique `/uploads`
- **Auth** : JWT (`jsonwebtoken`) + `bcryptjs`, middleware `backend/src/middleware/auth.ts`
- **Email** : `nodemailer` (`emailService.ts`, `newsletterService.ts`)

## 2. Frontends — `apps/` (4 apps React)
| App | Rôle | Build | Particularité |
|---|---|---|---|
| `luminaview-manager` | Admin central (port 8080) | CRA | Pages complètes : users, reports, albums, blog, user-pages |
| `luminaview-blog` | Blog public (8081) | CRA | Focus blog : posts, carnet, gallery |
| `chambre-noire` | Pellicules / développements (8082) | CRA | Duplique beaucoup le manager (Dashboard, AlbumView, Login…) |
| `luminaview-portfolio` | Portfolio public (8090) | **Vite** | Plus moderne, structure `views/`, thèmes via `variants.ts` |

**Conventions communes (3 apps CRA)** :
- Structure `context/` (Auth, Theme, Comments) + `utils/` (`api.ts`, `domain.ts`) + `components/` + `pages/`
- `MarkdownRenderer` partagé (react-markdown + rehype-sanitize)
- Tailwind + framer-motion

## 3. Données & Infrastructure
- **MongoDB 4.4** (contrainte matériel AVX), volume `./data/mongo`
- **Uploads** partagés `./data/uploads` montés dans le conteneur backend
- **docker-compose.yml** : 6 services (`mongo`, `backend:3000`, 4 fronts `:80`)
- Note : `docker-compose.yml` expose le backend en **3000**, mais `documentation/ARCHITECTURE.md` indique le port 5000 → **incohérence doc/code**.

## Points d'attention (recommandations)
1. **Duplication élevée** : `chambre-noire` et `manager` partagent ~15 pages/réutilisables identiques (Login, Dashboard, AlbumView, Lightbox…). → Extraire un package `ui`/`shared` commun dans le monorepo.
2. **Incohérence doc/port** : doc 5000 vs code 3000.
3. **Pas de workspace manager** (pas de `pnpm`/lerna/workspaces à la racine) → dépendances dupliquées par app, pas de build unifié.
4. **Secrets** : `JWT_SECRET` en clair dans `docker-compose.yml`.
5. Portfolio (Vite) est en avance technologique sur les 3 apps CRA (plus lent, non maintenu) — cible de migration cohérente.
