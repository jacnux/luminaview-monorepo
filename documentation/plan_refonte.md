# Plan de Refonte — Architecture LuminaView (2 faces : Studio + Vitrine)

> Objectif : tenir les préconisations de `analyse.md` (supprimer la duplication,
> unifier le design, corriger doc/port, workspace manager, secrets, migration Vite)
> tout en séparant **la gestion connectée** de la **vitrine publique**, sur le modèle
> de book.fr.

---

## 0. Principe directeur

On conserve **1 backend + 1 MongoDB** (`luminaview_core`) + 1 dossier `uploads` partagé
(cohérent avec `analyse.md`). On ne touche pas à la donnée. On réorganise **uniquement**
les frontends et le routing, en supprimant la duplication chambre-noire / manager.

| Face | Nom | Auth | Contenu | Domaine (prod) |
|------|-----|------|---------|----------------|
| **A — Studio** | `apps/studio` | **Connexion requise** | Pages, Articles, Projets, Albums, Users, **+ Chambre Noire** (films, boîtiers, objectifs, carnets) | `luminaview.fr` (ou `www.helioscope.fr`) |
| **B — Vitrine** | `apps/portfolio`, `apps/blog`, `apps/carnet` | **Aucune connexion** | 3 apps publiques reliées par liens internes | `(user).portfolio.helioscope.fr` → `(user).blog…` et `(user).carnet…` |

Modèle inspiré de book.fr : un espace privé de création unique (Studio), et une
vitrine publique découpée en **3 sous-domaines distincts** pour un même utilisateur,
reliés entre eux par des liens internes (sans `target="_blank"`).

---

## 1. Nouvelle arborescence du Monorepo

```
luminaview-Monorepo/
├─ package.json            # racine : pnpm workspace (NOUVEAU)
├─ pnpm-workspace.yaml     # NOUVEAU (préconisation #3 analyse.md)
├─ docker-compose.yml      # mis à jour : 2 fronts + backend + mongo
├─ docker-compose.prod.yml # mis à jour : VIRTUAL_HOST studio/vitrine
├─ .env / .env.prod        # JWT_SECRET + SMTP (préconisation #4)
├─ backend/                # INCHANGÉ (1 API centrale) + champ User.subdomain
├─ apps/
│  ├─ shared/              # NOUVEAU : design system + thèmes + utils (Vite lib)
│  │  ├─ src/
│  │  │  ├─ components/    # Navbar, Lightbox, MarkdownRenderer, AuthGuard…
│  │  │  ├─ themes/
│  │  │  │  ├─ standard.ts
│  │  │  │  ├─ minimaliste.ts
│  │  │  │  └─ mode.ts      # bascule clair/sombre (tokens)
│  │  │  ├─ context/       # ThemeContext, AuthContext
│  │  │  └─ utils/         # api.ts, domain.ts, slug.ts (résolution [user])
│  │  └─ package.json
│  ├─ studio/              # Face A (Vite) : ex manager + chambre-noire fusionnés
│  │  ├─ src/
│  │  │  ├─ pages/         # Login, Dashboard, Albums, Articles, Projects,
│  │  │  │                 #   Films, Gear, CarnetsManager, Users, Reports
│  │  │  └─ App.tsx        # routes protégées par <AuthGuard>
│  ├─ portfolio/           # Face B.1 (Vite, public) : (user).portfolio.helioscope.fr
│  ├─ blog/                # Face B.2 (Vite, public) : (user).blog.helioscope.fr
│  └─ carnet/              # Face B.3 (Vite, public) : (user).carnet.helioscope.fr
│     └─ (les 3 partagent shared/ ; [user] lu depuis window.location.hostname ;
│        liens internes B↔B sans target="_blank", retour Studio via lien dédié)
└─ documentation/
```

**Supprimés** : `apps/luminaview-manager`, `apps/chambre-noire`, `apps/luminaview-blog`,
`apps/luminaview-portfolio` (leur code est migré vers `shared` + `studio`/`vitrine`).

---

## 2. Package `shared` — unification du design (ta demande)

- **2 thèmes conservés** : `standard` et `minimaliste` (définis une seule fois).
- **Bascule clair/sombre** : un token `mode: 'light' | 'dark'` combiné au thème
  (ex: `standard + dark`). Centralisé dans `shared/themes/mode.ts`.
- Le choix (thème + mode) est stocké dans le profil `User` (modèle existant
  `backend/src/models/User.ts`) → la **vitrine** applique le thème/mode de
  l'utilisateur consulté ; le **studio** applique celui de l'utilisateur connecté.
- Composants partagés extraits de l'existant (Login, Dashboard, AlbumView,
  Lightbox, MarkdownRenderer, Navbar) → fin de la duplication ~15 pages
  (préconisation #1 `analyse.md`).

---

## 3. Face A — Studio (`apps/studio`, auth requise)

- Fusionne l'ancien **Manager** et la **Chambre Noire** (aujourd'hui dupliqués).
- Toutes les routes passent par `<AuthGuard>` (middleware `auth.ts` côté API déjà présent).
- Pages : connexion, tableau de bord, albums/photos, articles (blog), user-pages,
  projets, **films / boîtiers / objectifs / carnets**, gestion users, rapports.
- C'est le seul endroit où l'on **crée** les contenus.

## 4. Face B — Vitrine (3 apps publiques, reliées par liens internes)

- **3 sous-domaines** pour un même utilisateur, comme book.fr :
  - `(user).portfolio.helioscope.fr` → portfolio (page d'entrée de la vitrine)
  - `(user).blog.helioscope.fr` → blog
  - `(user).carnet.helioscope.fr` → carnet de route
- Aucune connexion. Le `user` est résolu depuis `window.location.hostname`
  (1 seul niveau de sous-domaine → compatible certificat `*.helioscope.fr`, voir `Plan.md`).
- Liens internes **B↔B** (portfolio→blog, portfolio→carnet…) sans `target="_blank"`
  (cohérent avec la correction de navigation déjà faite). Un lien "Éditer" renvoie
  vers le Studio (espace connecté).
- Les 3 apps partagent `shared/` et appliquent le **même thème + mode** que le Studio,
  selon le profil public de l'utilisateur ciblé.

---

## 5. Backend — modifications minimales

- **Aucun** split de base, **aucune** nouvelle route obligatoire.
- Ajout d'un champ `subdomain` (ou réutilisation du `username`) dans `User.ts`
  pour résoudre `[user].x.helioscope.fr`.
- Les routes existantes (`blogRoutes`, `filmRoutes`, `gearRoutes`, `projectRoutes`,
  `userPagesRoutes`, `photoRoutes`, `albumRoutes`) restent montées dans `server.ts`.
- La séparation Studio/Vitrine est **frontend-only** (quel composant appelle quelle route).

---

## 6. Corrections des points d'attention `analyse.md`

| # | Problème | Action dans ce plan |
|---|----------|---------------------|
| 1 | Duplication chambre-noire/manager | `shared/` + fusion en `studio` |
| 2 | Incohérence port 5000 (doc) vs 3000 (compose) | Uniformiser sur `3000` dans `ARCHITECTURE.md` et `server.ts` |
| 3 | Pas de workspace manager | Ajout `pnpm-workspace.yaml` + `package.json` racine |
| 4 | `JWT_SECRET` en clair | Déjà retiré en prod ; supprimer aussi de `docker-compose.yml` dev → `.env` |
| 5 | Apps CRA dépassées | `studio` et `vitrine` en **Vite** (comme portfolio actuel) |

---

## 7. Routing / DNS & Docker (prod)

`docker-compose.prod.yml` (4 fronts : studio + 3 vitrines) :

```yaml
studio:
  environment:
    - VIRTUAL_HOST=luminaview.fr,www.helioscope.fr
portfolio:
  environment:
    - VIRTUAL_HOST=*.portfolio.helioscope.fr
blog:
  environment:
    - VIRTUAL_HOST=*.blog.helioscope.fr
carnet:
  environment:
    - VIRTUAL_HOST=*.carnet.helioscope.fr
```

Le reverse-proxy (Caddy/nginx-proxy déjà présent dans `caddy-proxy-files/`)
route vers le bon conteneur ; la vitrine lit `window.location.hostname`
pour déduire l'utilisateur.

---

## 8. Ordre de mise en œuvre (recommandé)

1. Créer `pnpm-workspace.yaml` + `package.json` racine ; migrer les 4 apps en Vite.
2. Créer `apps/shared` (thèmes standard/minimaliste + clair/sombre, composants, utils).
3. Créer `apps/studio` (fusion manager + chambre-noire, auth guard).
4. Créer `apps/portfolio`, `apps/blog`, `apps/carnet` (publiques, partagent `shared`,
   résolution [user] depuis le sous-domaine, liens internes B↔B sans `target="_blank"`).
5. Backend : ajouter `subdomain` à `User`, vérifier montage des routes.
6. Mettre à jour `docker-compose*.yml` (4 fronts : studio + 3 vitrines) + `.env` (secrets).
7. Corriger `ARCHITECTURE.md` (port 3000) et mettre à jour `GUIDE_UTILISATEUR.md`.
8. Tests : build unifié `pnpm -r build` ; navigation Studio↔Vitrine sans `target="_blank"`.

---

## 9. Open questions (à valider avant dev)

- Nom de domaine principal de la Face A : `luminaview.fr` ou `www.helioscope.fr` ?
- Le champ `subdomain` doit-il être libre ou égal au `username` existant ?
- Faut-il conserver les anciennes URLs (`/uploads`, anciens slugs) en redirection ?
