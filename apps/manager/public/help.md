# Manuel Utilisateur — Lumina Studio & Écosystème LuminaView

Ce document présente le fonctionnement complet de **Lumina Studio** et des applications publiques associées (**Portfolio Artfolio**, **Blog Hélioscope**, **Chambre Noire**), en intégrant l'ensemble des règles de navigation, de gestion du matériel/pellicules et des interrupteurs de modules.

---

## 1. Tableau de bord & Navigation Studio

Une fois connecté à **Lumina Studio** (`http://localhost:7080` ou `https://luminaview.fr`), vous accédez à votre tableau de bord central :

- **📂 Albums & Galeries** : Gestion des albums photo manuels et des galeries virtuelles dynamiques basées sur des tags.
- **📄 Mes Pages** : Édition des pages du Portfolio public avec hiérarchie parent/enfant (Séries, Expositions, À propos).
- **✍️ Mon Blog** : Rédaction d'articles et actualités (accessible si le module Blog est activé).
- **🎞️ Carnets & Chambre Noire** : Gestion du matériel photo, des rouleaux de films/plans-films et des projets de prises de vue (accessible si le module Carnet est activé).
- **👤 Mon Profil** : Avatar, bannière, biographie, choix du thème visuel (Classic/Artfolio) et activation/désactivation des modules Blog et Carnet.
- **💬 Commentaires** : Consultation et modération des messages reçus sur vos clichés et articles.
- **🔍 Recherche Instantanée** : Filtrage en temps réel dans vos listes d'albums, galeries et pages.

---

## 2. Modules & Extensions On/Off

Dans **Mon Profil** (`EditProfile.tsx`), la section **⚙️ Modules & Extensions** propose deux interrupteurs On/Off :

1. **Module Blog ** :
   - **ON** : Active la rubrique **Mon Blog** dans votre Studio, ajoute le lien `Voir mon blog` dans votre menu latéral et affiche le lien `Actualités` dans le menu de votre Portfolio public.
   - **OFF** : Masque automatiquement les entrées relatives au blog dans tous vos menus.
2. **Module Carnet de route ** :
   - **ON** : Active la section **Chambre Noire & Carnets** dans votre Studio, ajoute les liens `Voir mon carnet` et `Carnets` dans votre menu, et affiche le lien `Carnet` sur votre Portfolio public.
   - **OFF** : Masque les accès au carnet de route et à la mémoire technique.

---

## 3. Topologie des Domaines & URLs de Production

LuminaView orchestre 4 sous-domaines web distincts avec certificats HTTPS automatiques (Caddy SSL) :

| Module                     | URL Développement (Local)              | URL Production (Caddy)                  |
| :------------------------- | :------------------------------------- | :-------------------------------------- |
| **Studio (Manager)**       | `http://localhost:7080`                | `https://luminaview.fr`                 |
| **Portfolio (Artfolio)**   | `http://localhost:7090/?user=[pseudo]` | `https://[pseudo].helioscope.fr`        |
| **Blog (Hélioscope)**      | `http://localhost:7081/?user=[pseudo]` | `https://[pseudo]-blog.helioscope.fr`   |
| **Carnet (Chambre Noire)** | `http://localhost:7082/?user=[pseudo]` | `https://[pseudo]-carnet.helioscope.fr` |

---

## 4. Chambre Noire & Mémoire de Laboratoire

La section **Carnets / Chambre Noire** vous permet de consigner l'intégralité de votre mémoire technique :

### A. Matériel Photo (Gear)

1. Cliquez sur **📷 Matériel Photo** puis **Ajouter un matériel**.
2. Spécifiez le type (Boîtier ou Objectif), la marque, le modèle, le format supporté (_135_, _120_, _plan-film 4x5/9x12_) et le numéro de série facultatif.
3. Ce matériel sera sélectionnable lors de la saisie de vos photos et pellicules.

### B. Rouleaux & Plans-Films (Films)

1. Cliquez sur **🎞️ Pellicules** puis **Ajouter un film**.
2. Renseignez la marque (ex: _Kodak_), le type (ex: _Tri-X 400_), la sensibilité nominale (ISO 400), la sensibilité utilisée (ISO 800 si poussé) et le format (_135_, _120_, _plan-film_).
3. **Paramètres Chimie par Défaut** : Renseignez le révélateur (nom, dilution, temps, température, agitation, push/pull) et le fixateur (nom, dilution, temps). Ces valeurs s'appliqueront automatiquement à toutes les photos liées à cette pellicule.

### C. Planche-Contact Virtuelle

1. Dans la liste des pellicules, cliquez sur une carte de film pour ouvrir sa **Planche-Contact**.
2. La grille affiche exactement le nombre de cases de la pellicule (ex: 36 vues en 35mm, 12 vues en 120, 1 plan-film).
3. Cliquez sur **Associer** sur n'importe quelle vue pour :
   - Choisir une photo existante depuis votre **Galerie**.
   - Ou téléverser une nouvelle image directement pour cet emplacement.

---

## 5. Éditeur Notebook & Rédaction Markdown

La rédaction des articles de blog et des descriptions de projets s'effectue dans un **Éditeur type Notebook** ultra-épuré :

- **Barre d'outils flottante** : Boutons d'insertion rapide (Gras, Italique, Titres, Citations, Liens, Images, Listes).
- **Enveloppement intelligent** : Sélectionnez un mot ou phrase et cliquez sur un outil Markdown pour l'envelopper automatiquement sans perdre votre position de curseur.

### Syntaxe Markdown Supportée :

```markdown
# Titre Principal

## Sous-titre

**Texte en gras** | _Texte en italique_

- Élément de liste 1
- Élément de liste 2

![Légende de la photo](/uploads/image.jpg)

[Lien vers mon exposition](https://jac.helioscope.fr)
```

---

## 6. Partage & Code d'Intégration (Iframe)

Pour chaque projet de votre Carnet de route, vous disposez d'un bouton **Partager** :

- **Lien de la page** : Permet de partager directement l'URL publique de la page de projet (`http://localhost:7082/project/slug?user=jac` ou `https://jac-carnet.helioscope.fr/project/slug`).
- **Code d'intégration Iframe** : Génère automatiquement un code HTML épuré ciblant la route d'intégration `/embed/project/slug` :
  ```html
  <iframe
    src="http://localhost:7082/embed/project/slug?user=jac"
    width="100%"
    height="600"
    frameborder="0"
  ></iframe>
  ```
  Ce code s'intègre parfaitement dans n'importe quel site tiers ou article de blog sans afficher de barre de navigation ou de pied de page parasite.

---

## 7. Structure des Pages du Portfolio

Dans **Mes Pages**, vous pouvez créer et organiser vos contenus sous les rubriques suivantes (`menuGroup`) :

| `menuGroup`   | Destination     | Usage recommandé                               |
| :------------ | :-------------- | :--------------------------------------------- |
| `series`      | **Séries**      | Ensemble thématique cohérent de photographies. |
| `exhibitions` | **Expositions** | Accrochages, galeries et événements publics.   |
| `blog`        | **Actualités**  | Articles éditoriaux (si module Blog activé).   |
| `about`       | **À propos**    | Démarche artistique, biographie et contact.    |

### Relations Parent / Enfant (`parentPageId`) :

Une page parente peut regrouper des sous-pages (niveau n-1 et n-2). La page parente affiche automatiquement les cartes de ses pages filles sous forme d'index avec leurs images de couverture (`coverImage`).
