# Chambre Noire

## L'outil de mémoire technique, de carnet de route et de laboratoire photographique

![Chambre Noire](/uploads/Helioscope_ecran.jpg)

**La photographie mérite un espace sobre, élégant et axé sur la rigueur technique et artistique.**

**Chambre Noire** n’est pas un simple hébergeur d’images ou un portfolio générique. C’est un environnement complet conçu spécifiquement pour les photographes (argentiques, numériques et procédés anciens) désireux de consigner la mémoire technique de leurs prises de vue, d'organiser leurs sorties sous forme de carnets de route, et de partager leurs clichés avec tous leurs paramètres de laboratoire et d'exposition.

---

## 🎞️ Un véritable Carnet de Route Technique et Artistique

Chambre Noire s'organise autour d'une interface publique épurée permettant aux visiteurs de parcourir vos sorties photographiques. Pour chaque projet et chaque cliché, l'outil présente de façon structurée :

* **Les données de prise de vue** : boîtier, objectif, ouverture, vitesse d'obturation, focale et sensibilité (ISO).
* **La mémoire de laboratoire (Chimie & Labo)** : type de pellicule (Format 135, 120, plan-film 4x5/9x12), sensibilité nominale et exposée du film, révélateur utilisé (nom, dilution, temps de développement, température, agitation, push/pull), ainsi que les paramètres de fixateur (nom, dilution et temps de fixage).
* **L'intention artistique** : notes sur l'intention de prise de vue, conditions lumineuses, filtres physiques (Rouge, Jaune, ND), parasoleil et secrets de fabrication (Markdown supporté).
* **Planches-contacts virtuelles** : visualisation sous forme de bande de négatifs ou de châssis correspondant exactement au nombre de vues de vos films (36 vues, 12 vues ou plan-film).

---

## 🔗 Intégration simplifiée et export Iframe (`/embed/`)

Chambre Noire intègre des routes d'affichage nettoyées de tout menu de navigation, spécialement conçues pour être partagées ou intégrées (via iframe) directement sur un autre site web, un portfolio externe ou un blog personnel :

* **`/embed/carnet-de-routes`** : Affiche la liste complète de vos projets sous forme de flux épuré, sans en-tête ni bouton de navigation parasite.
* **`/embed/project/:slug`** : Affiche les détails techniques et les clichés grand format d'un projet spécifique de façon totalement intégrée.

---

## 🌐 Intégration dans l'Écosystème LuminaView (`refonte-gemini`)

Chambre Noire s'intègre harmonieusement au sein de l'écosystème multi-domaines LuminaView :

* **Plateforme publique dédiée** : Accessible directement sur votre sous-domaine autonome `https://[votre-pseudo]-carnet.helioscope.fr` *(ou `http://localhost:7082/?user=[pseudo]` en local)*.
* **Gestion centralisée depuis Lumina Studio** : L'administration de votre matériel, de vos pellicules et de vos projets s'effectue directement depuis votre espace privé **Lumina Studio** (`lumina.fr` / port 7080).
* **Module activable sur-mesure (`hasCarnet`)** : Vous pouvez activer ou désactiver l'affichage du Carnet de route à tout moment depuis votre profil Studio pour adapter vos menus de navigation.
