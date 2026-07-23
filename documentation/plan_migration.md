# Plan de migration — Suppression de la duplication (approche "big bang")

## Diagnostic confirmé
`luminaview-manager` et `chambre-noire` partagent **27 fichiers** quasi-identiques
(`context/ThemeContext`, `AuthContext`, `utils/api.ts`, `MarkdownRenderer`, `Lightbox`,
13 pages, 3 modales…). Seuls `domain.ts`, `Layout.tsx` et `lv-components.css` diffèrent
réellement (logique sous-domaine `-carnet` et styles). Le blog chevauche partiellement
(`MarkdownRenderer`, `ThemeContext`) mais reste secondaire.

---

## Phase 0 — Sécurisation & socle (prérequis)
- **0.1** Créer une branche `refactor/shared-package` + commit propre ; arrêter les
  conteneurs et **sauvegarder `data/mongo`** avant tout.
- **0.2** Activer un **workspace npm** à la racine : `package.json` racine avec
  `"workspaces": ["apps/*", "packages/*"]` (permet la symlink du package partagé sans publish).
- **0.3** Créer `packages/shared/` (structure TS, `tsconfig`, `package.json` nommé
  `@luminaview/shared`).

## Phase 1 — Création du package `@luminaview/shared`
- **1.1** Déplacer les fichiers **strictement identiques** : `ThemeContext`, `AuthContext`,
  `utils/api.ts`, `MarkdownRenderer`, `Lightbox`, `EditAlbumModal`, `EditPhotoModal`,
  `PhotoInfoModal`.
- **1.2** `domain.ts` → rendre la logique `-carnet` **paramétrable** (option `enableCarnet`
  ou fonction injectée) pour servir les 2 apps.
- **1.3** `Layout.tsx` + `lv-components.css` → **réconcilier** en une version commune
  (différences minimes, factorisables via props/CSS variables).
- **1.4** Exposer via `index.ts` (barrel) + `tsconfig` (`composite`/`declaration`).
  Build via **`tsup`** (génère JS + d.ts consommables direct par CRA sans rewire).

## Phase 2 — Refactor `luminaview-manager`
- **2.1** Remplacer tous les imports locaux par `@luminaview/shared`.
- **2.2** Supprimer les fichiers dupliqués de `apps/luminaview-manager/src`.
- **2.3** Garder **uniquement** ses pages spécifiques : `BlogManager`, `UserPagesManager`,
  `UserPageEditor`, `CommentsPage`, `AdminReports`, `PortfolioPage`, `UserPageView`,
  `LandingPage`, `DashboardHelp/About`, `LegalPage`.

## Phase 3 — Refactor `chambre-noire`
- **3.1** Mêmes remplacements d'imports + suppression des fichiers dupliqués.
- **3.2** Garder ses pages spécifiques : `CarnetDeRoutesPage`, `CarnetRoutesManager`,
  `ProjectDetailPage`, `Dashboard` (variante carnet).

## Phase 4 — Build & Docker (impact "big bang")
- **4.1** Mettre à jour les `Dockerfile` des 2 apps pour **builder `packages/shared` en
  premier** puis l'app (ou script `build` racine
  `npm run build -w @luminaview/shared && npm run build`).
- **4.2** Vérifier que CRA résout le workspace (symlink `node_modules/@luminaview/shared`
  + `tsup` build en dist) ; sinon `react-app-rewired`/`craco` pour autoriser les imports src.

## Phase 5 — Vérification
- **5.1** `npm run build` local sur les 2 apps + `docker compose build manager chambrenoire`.
- **5.2** Smoke test : `localhost:8080` (manager) et `localhost:8082` (chambrenoire),
  dont la route `-carnet` (sous-domaine).
- **5.3** Comparaison visuelle Lightbox / Markdown / Login / AlbumView.

## Phase 6 — Nettoyage
- **6.1** Supprimer les `.DS_Store` résiduels.
- **6.2** (Bonus) Corriger l'incohérence doc/port (`ARCHITECTURE.md` 5000 → 3000) et
  sortir `JWT_SECRET` du `docker-compose.yml`.

---

## Risques & mitigations
| Risque | Mitigation |
|---|---|
| `domain.ts`/`Layout` diffèrent | Abstraction par options/props en Phase 1.2-1.3 |
| CRA ne consomme pas un pkg TS workspace | Build `tsup` → dist JS+d.ts (Phase 1.4) |
| Régression visuelle après suppression | Tests smoke Phase 5 + backup Phase 0.1 |
| Couplage caché (imports relatifs) | Grep des imports avant suppression (Phase 2.2/3.1) |

## Ordre de priorité (impact/effort)
1. **Phase 0** (sécurité, ~0 risque) — *fait en premier, obligatoire*
2. **Phase 1** (cœur de la valeur) — package shared
3. **Phase 2 & 3** (refactor parallèle)
4. **Phase 4** (Docker) → **Phase 5** (tests) → **Phase 6** (nettoyage)
