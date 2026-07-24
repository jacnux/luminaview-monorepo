# LuminaView & Lumina Studio

## La plateforme d'édition photographique et de mémoire technique tout-en-un

![LuminaView](/uploads/1784901834681.png)

**La photographie mérite un espace sobre, élégant, vivant et techniquement rigoureux.**

**LuminaView** dépasse la simple fonction de galerie d'images. C'est un écosystème numérique complet conçu pour les photographes d'aujourd'hui, qu'ils travaillent en numérique, en argentique (135, 120, plan-film) ou en procédé mixte. La plateforme permet d'organiser ses séries, d'enrichir ses travaux d'une écriture éditoriale, d'archiver la mémoire technique de ses prises de vue et de diffuser des espaces publics autonomes et personnalisables.

---

## 🚀 Les 4 Espaces de l'Écosystème .

LuminaView repose sur une architecture découplée organisée autour de 4 piliers principaux :

### 1. ⚡ Lumina Studio (Manager & Administration)

- **Adresse Production** : `https://luminaview.fr` _(Port dev local : 7080)_
- **Rôle** : Votre tableau de bord privé et centralisé. Il permet de gérer l'intégralité de votre travail :
  - Gestion des albums photo et galeries virtuelles basées sur des tags.
  - Création de pages éditoriales (Séries, Expositions, À propos).
  - Rédaction d'articles de blog et modération des commentaires.
  - Gestion du matériel photo (boîtiers, objectifs) et des rouleaux de pellicules.
  - Activation / Désactivation des modules optionnels (**Blog** et **Carnet de route**) via de simples interrupteurs On/Off.

### 2. 🖼️ Portfolio Public (Artfolio)

- **Adresse Production** : `https://[votre-pseudo].helioscope.fr` _(Port dev local : 7090)_
- **Rôle** : Votre vitrine d'exposition principale, autonome et épurée.
  - Thèmes visuels personnalisables (**Hélioscope Classic** avec menu horizontal ou **Artfolio** avec sidebar latérale fixe).
  - Mise en valeur de vos séries photographiques, expositions, biographie et coordonnées.
  - Liens automatiques vers votre Blog et votre Carnet de route lorsque ces modules sont activés dans votre profil.

### 3. ✍️ Blog Public (Hélioscope)

- **Adresse Production** : `https://[votre-pseudo]-blog.helioscope.fr` _(Port dev local : 7081)_
- **Rôle** : Votre journal d'actualités et d'écriture photographique.
  - Publication d'articles, récits de prises de vue, coulisses et nouveautés de votre activité.
  - Éditeur type **Notebook** épuré et puissant avec mise en forme Markdown interactive.
  - Espace de commentaires pour interagir directement avec votre public.

### 4. 🎞️ Chambre Noire (Carnets de Route & Mémoire Technique)

- **Adresse Production** : `https://[votre-pseudo]-carnet.helioscope.fr` _(Port dev local : 7082)_
- **Rôle** : Votre carnet de terrain et mémoire de laboratoire.
  - Fiches détaillées pour chaque cliché : boîtier, objectif, ouverture, vitesse, focale, filtre physique et parasoleil.
  - Fiches de chimie et de laboratoire : type de film (135, 120, plan-film 4x5), ISO nominal/exposé, révélateur (produit, dilution, temps, température, agitation, push/pull) et fixateur.
  - Planches-contacts virtuelles correspondant exactement à la taille de vos rouleaux (Vue #1 à #36 ou plan-film).
  - Modes d'intégration iframe épurés (`/embed/carnet-de-routes` et `/embed/project/:slug`) sans barre de navigation pour incruster vos carnets sur n'importe quel site tiers.

---

## 🎛️ Nouveautés de la Refonte

- **Modules On/Off configurables** : Activer ou désactiver les modules **Blog** (`hasBlog`) et **Carnet** (`hasCarnet`) d'un simple clic dans votre profil. Les menus de navigation du Studio, du Portfolio et du Blog s'adaptent instantanément sans temps de latence.
- **Architecture multi-domaines & Caddy SSL Auto** : Routage automatique des sous-domaines (`*.helioscope.fr`) avec certificats HTTPS délivrés dynamiquement par Let's Encrypt.
- **Moteur Vite + React 18 & Docker Compose** : Compilation ultra-rapide et déploiement containerisé réactif.
- **Éditeur Markdown Notebook** : Un espace de rédaction minimaliste et immersif avec barre d'outils flottante et enveloppement intelligent de sélection.
- **Hiérarchie parent/enfant des pages** : Organisez vos séries et expositions en sous-rubriques complexes (niveaux n-1 et n-2) avec images de couverture et accroches d'en-tête.
- **Génération et partage Iframe** : Générateur de code `<iframe>` propre pour exporter vos projets et planches-contacts sur vos autres sites web.

---

LuminaView offre aux photographes un outil sur-mesure pour montrer, documenter et faire vivre leur travail avec une tenue éditoriale et technique exceptionnelle.
