# Manuel Utilisateur — Lumina Studio & Écosystème LuminaView

Bienvenue dans le guide d'utilisation de **Lumina Studio** et de ses modules associés (**Portfolio**, **Chambre Noire**, **Blog**, **Grimoire**).

---

## 1. Démarrage Rapide & Navigation

Une fois connecté à **Lumina Studio** (`http://localhost:7080` ou `https://luminaview.fr`), accédez à vos rubriques depuis le menu :

* **🎞️ Chambre Noire** : Espace complet de création (Idées en amont, Carnet de route / Projets de terrain, Matériel & Laboratoire).
* **📂 Albums & Galeries** : Organisation de vos photos en albums manuels ou galeries dynamiques par tags.
* **📄 Mes Pages** : Création des pages de votre portfolio public (Séries, Expositions, Bio).
* **✍️ Mon Blog** : Rédaction d'articles d'actualité et récits de prise de vue.
* **👤 Mon Profil** : Paramètres personnels, choix du thème et activation des modules optionnels.

---

## 2. Activer ou Masquer des Modules (On/Off)

Dans **Mon Profil** > **Modules & Extensions**, activez ou désactivez les fonctionnalités selon vos besoins :

1. **Module Blog** : Active la rédaction d'articles et affiche le lien *Actualités* sur votre Portfolio.
2. **Module Chambre Noire** : Active l'espace de création (Idées, Projets, Matériel & Labo) et affiche le lien *Chambre Noire* sur votre Portfolio.

---

## 3. L'Espace Chambre Noire : Les 3 Piliers de Création

Dans le Studio, la section **🎞️ Chambre Noire** regroupe l'intégralité du cycle créatif d'un photographe :

### Pilier 1 : 💡 Idées & Préparation (En amont)
Consignez vos projets en gestation avant de partir en prise de vue :
1. **Créer une idée** : Cliquez sur `+ Nouvelle Idée` et renseignez :
   * **Titre** : Intitulé clair de l'idée (ex: *Portraits en clair-obscur au 85mm*).
   * **Tags** : Mots-clés thématiques séparés par des virgules (`#portrait`, `#studio`, `#n&b`).
   * **Date cible** *(optionnel)* : Échéance ou période visée pour la réalisation.
   * **Notes & Intentions** : Rédigez vos intentions en Markdown et insérez des images de référence ou croquis via le bouton `📎 Image / Référence`.
2. **Consulter en grand format** : Cliquez sur le bouton `👁️ Voir` pour ouvrir la **grande fenêtre de lecture** dédiée à votre idée.
3. **Concrétiser en Projet** : Cliquez sur `🚀 Concrétiser en Projet` pour transformer automatiquement l'idée en projet photographique actif sans aucune ressaisie.

### Pilier 2 : 📖 Carnet de route (Projets & Prises de vue de terrain)
Organisez vos sorties et séries photographiques :
1. **Créer un projet** : Renseignez un titre, un résumé, des tags et associez vos photos.
2. **Paramètres de prise de vue par cliché** :
   * **Exposition** : Boîtier, objectif, ouverture (*f/2.8*), vitesse (*1/250s*), sensibilité (ISO), filtres physiques et parasoleil.
   * **Éclairage artificiel** : Si la lumière est définie sur *Artificielle* ou *Flash*, choisissez votre source (sélection rapide depuis votre matériel) et réglez la puissance utilisée (**de `1/256` à `1/1`**).
   * **Argentique** : Pellicule rattachée et paramètres de chimie hérités.

### Pilier 3 : 🧪 Laboratoire & Mémoire technique
Consignez l'ensemble de votre équipement et de vos procédés argentiques :
1. **📷 Matériel & Éclairage (Gear)** :
   * **Boîtiers & Objectifs** : Marque, modèle, formats (*135*, *120*, *plan-film 4x5*) et numéro de série facultatif.
   * **Éclairages** : Type (**Flash** ⚡ ou **Lumière continue** ☀️), marque, modèle et puissance maximale en Watts.
2. **🎞️ Pellicules & Chimie (Films)** :
   * **Ajouter un film** : Marque (*ex: Kodak*), modèle (*ex: Tri-X 400*), sensibilités nominale/exposée (ISO) et format.
   * **Chimie par défaut** : Révélateur (dilution, temps, température, agitation, push/pull) et fixateur.
   * **Planche-Contact Virtuelle** : Grille fidèle au format du rouleau (36 vues, 12 vues, plan-film) avec association photo par numéro de vue.

---

## 4. Partage & Intégration Externe (Iframe)

Chaque projet de votre Chambre Noire dispose d'un bouton **Partager** offrant :
* **Lien public direct** : Vers la page de votre projet dans la Chambre Noire.
* **Code d'intégration Iframe** : Un code HTML prêt à l'emploi (`/embed/project/:slug`) pour intégrer votre projet ou carnet sans barre de navigation sur un site tiers (WordPress, site personnel).

---

## 5. Aide-mémoire Markdown

Les descriptions de projets, notes d'idées et articles acceptent la syntaxe Markdown :

```markdown
# Titre de section
## Sous-titre
**Texte en gras** | *Texte en italique*

- Élément de liste à puces
1. Élément de liste numérotée

![Légende](/uploads/mon-image.jpg)
[Lien vers mon site](https://monsite.fr)
```
