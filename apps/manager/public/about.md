# LuminaView & Lumina Studio

## La plateforme d'édition photographique et de mémoire technique tout-en-un

![LuminaView](/uploads/luminaview.png)

> **La photographie mérite un espace sobre, élégant, vivant et techniquement rigoureux.**

**LuminaView** est un écosystème numérique complet conçu pour les photographes d'aujourd'hui, qu'ils travaillent en numérique, en argentique (135, 120, grand format) ou en procédés alternatifs. La plateforme permet d'organiser ses travaux, de consigner la mémoire technique de ses prises de vue et de publier des espaces web publics élégants et autonomes.

---

## 🚀 Les 5 Espaces de l'Écosystème

LuminaView repose sur 5 applications interconnectées :

### 1. 🎛️ Lumina Studio (Manager & Administration)
* **URL** : `https://luminaview.fr` *(ou `http://localhost:7080` en local)*
* **Rôle** : Votre tableau de bord privé centralisé pour administrer vos albums, vos galeries virtuelles par tags, vos pages éditoriales et vos modules On/Off.

### 2. 🖼️ Portfolio Artfolio
* **URL** : `https://[pseudo].helioscope.fr` *(ou `http://localhost:7090`)*
* **Rôle** : Votre vitrine publique principale pour exposer vos séries photographiques, vos expositions et votre démarche artistique (thèmes Classic & Artfolio).

### 3. 🎞️ Chambre Noire (Espace de Création & Labo)
* **URL** : `https://[pseudo]-carnet.helioscope.fr` *(ou `http://localhost:7082`)*
* **Rôle** : Votre univers de création complet, articulé autour de 3 piliers :
  * **💡 1. Idées & Préparation** : Consignez vos inspirations, mots-clés et notes enrichies (Markdown, images de repérage), puis convertissez-les en projets réels en un clic.
  * **📖 2. Carnet de route (Projets)** : Publiez vos séries et sorties de terrain avec fiches techniques détaillées (exposition, éclairage flash/continu de 1/256 à 1/1, filtres).
  * **🧪 3. Laboratoire & Mémoire technique** : Inventaire du matériel, suivi des rouleaux de films, planches-contacts interactives et chimies de développement.

### 4. ✍️ Blog Hélioscope
* **URL** : `https://[pseudo]-blog.helioscope.fr` *(ou `http://localhost:7081`)*
* **Rôle** : Votre journal de création et d'actualités photographiques avec éditeur Notebook immersif (Markdown) et espace de commentaires.

### 5. 📜 Grimoire (Galeries Virtuelles)
* **URL** : `https://[pseudo]-grimoire.helioscope.fr` *(ou `http://localhost:7091`)*
* **Rôle** : Exposition épurée et dynamique de vos albums virtuels (sélections automatiques par tags ou dates).

---

## 🎛️ Points Forts & Architecture

* **🎞️ Chambre Noire unifiée** : Un flux créatif fluide de l'idée initiale à la mémoire technique de laboratoire.
* **⚡ Gestion complète de l'éclairage** : Prise en charge des flashs et lumières continues (matériel, puissance de 1/256 à 1/1).
* **🧪 Rigueur argentique** : Révélateur, dilution, température, agitation, push/pull et fixateur.
* **🌐 Architecture multi-domaines** : Sous-domaines automatiques avec certificats SSL sécurisés (Caddy).
* **🔗 Intégration iframe propre** : Export de projets et carnets sans éléments d'interface parasites.
