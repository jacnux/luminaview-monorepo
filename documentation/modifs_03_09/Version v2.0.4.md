# Version v2.0.4 — Synchronisation Automatique de la Navigation et de la Visibilité (Blog & Portfolio)

## Objectif & Contexte

Dans le **Studio Manager** (`apps/manager`), le module de gestion et d'édition de page (`UserPageEditor.tsx`) permet de configurer :
1. La **Navigation** : la section du menu (`menuGroup` : *Aucune*, *Séries*, *Expositions*, *Blog*, *À propos*), l'ordre d'affichage et l'état de visibilité dans le menu (`showInMenu` : *Visible dans le menu* / *Masqué du menu*).
2. La **Visibilité** : publication sur le portfolio (`isPublished`) et visibilité sur le blog (`showOnBlog`).

Auparavant, la désactivation de la publication ou de la visibilité sur le blog laissait parfois la section de navigation ou le bouton d'affichage dans le menu actifs, ce qui pouvait engendrer des incohérences.

La version **v2.0.4** automatise et fiabilise les transitions d'état entre visibilité et menu.

---

## Règles Implémentées

### 1. Désactivation « Visible sur le blog » (`showOnBlog = false`)
- Si la page était rattachée à la section **Blog** (`menuGroup === 'blog'`), `menuGroup` repasse automatiquement à **« Aucune »** (`none`).
- Le statut du bouton de menu passe automatiquement à **« Masqué du menu »** (`showInMenu = false`).

### 2. Désactivation « Publié sur le portfolio » (`isPublished = false` / *Hors ligne portfolio*)
- Si la page était rattachée à une section portfolio (*Séries*, *Expositions*, *À propos*), `menuGroup` repasse automatiquement à **« Aucune »** (`none`) et la page parente (`parentPageId`) est réinitialisée.
- Le statut du bouton de menu passe automatiquement à **« Masqué du menu »** (`showInMenu = false`).

### 3. Changement direct de section de menu (`menuGroup`)
- Sélection de **« Blog »** : active automatiquement `showOnBlog = true`.
- Sélection de **« Séries »**, **« Expositions »** ou **« À propos »** : active automatiquement `isPublished = true`.
- Sélection de **« Aucune »** : bascule automatiquement `showInMenu = false` et réinitialise `parentPageId = ''`.

---

## Fichiers Modifiés

- **[`apps/manager/src/pages/UserPageEditor.tsx`](file:///Users/jac/docker/hi3/luminaview-Monorepo/apps/manager/src/pages/UserPageEditor.tsx)** : Implémentation des gestionnaires `handleMenuGroupChange`, `handleTogglePublished` et `handleToggleShowOnBlog` garantissant l'intégrité des états.
- **[`package.json`](file:///Users/jac/docker/hi3/luminaview-Monorepo/package.json)** : Montée de version en **`2.0.4`**.
