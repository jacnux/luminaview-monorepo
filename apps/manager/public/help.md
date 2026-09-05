# Manuel Utilisateur — Lumina Studio & Écosystème LuminaView

Bienvenue dans le guide d'utilisation de **Lumina Studio** et de ses modules associés (**Portfolio**, **Chambre Noire**, **Blog**, **Grimoire**).

---

## 1. Démarrage Rapide & Navigation

Une fois connecté à **Lumina Studio** (`http://localhost:7080` ou `https://luminaview.fr`), accédez à vos rubriques depuis le menu :

* **💡 Boîte à Idées** : Carnet de réflexion pour préparer vos futures séries et sorties.
* **🎞️ Carnets & Chambre Noire** : Gestion de vos projets, matériel, pellicules et planches-contacts.
* **📂 Albums & Galeries** : Organisation de vos photos en albums manuels ou galeries dynamiques par tags.
* **📄 Mes Pages** : Création des pages de votre portfolio public (Séries, Expositions, Bio).
* **✍️ Mon Blog** : Rédaction d'articles d'actualité et récits de prise de vue.
* **👤 Mon Profil** : Paramètres personnels, choix du thème et activation des modules optionnels.

---

## 2. Activer ou Masquer des Modules (On/Off)

Dans **Mon Profil** > **Modules & Extensions**, activez ou désactivez les fonctionnalités selon vos besoins :

1. **Module Blog** : Active la rédaction d'articles et affiche le lien *Actualités* sur votre Portfolio.
2. **Module Carnet de route** : Active la Chambre Noire (projets, mémoire technique, matériel) et affiche le lien *Carnet* sur votre Portfolio.

---

## 3. La Boîte à Idées Photographiques

La Boîte à Idées vous aide à matérialiser vos projets avant de partir en prise de vue :

1. **Créer une idée** : Cliquez sur `+ Nouvelle Idée` et renseignez :
   * **Titre** : Intitulé clair de l'idée (ex: *Portraits en clair-obscur au 85mm*).
   * **Tags** : Mots-clés thématiques séparés par des virgules (`#portrait`, `#studio`, `#n&b`).
   * **Date cible** *(optionnel)* : Échéance ou période visée pour la réalisation.
   * **Notes & Intentions** : Rédigez vos intentions en Markdown et insérez des images de référence ou croquis via le bouton `📎 Image / Référence`.
2. **Consulter en grand format** : Cliquez sur le bouton `👁️ Voir` pour ouvrir la **grande fenêtre de lecture** dédiée à votre idée.
3. **Concrétiser en Projet** : Cliquez sur `🚀 Concrétiser en Projet` pour transformer automatiquement l'idée en projet photographique actif dans votre Carnet de route, sans aucune ressaisie.

---

## 4. Matériel Photo & Éclairage (Gear)

Consignez l'ensemble de votre équipement dans **Carnet & Chambre Noire** > **📷 Matériel Photo** :

* **Boîtiers & Objectifs** : Marque, modèle, formats acceptés (*135*, *120*, *plan-film 4x5*) et numéro de série facultatif.
* **Éclairages** : Type (**Flash** ⚡ ou **Lumière continue** ☀️), marque, modèle et puissance maximale en Watts.
* *Ces équipements seront directement sélectionnables lors de la saisie de vos clichés.*

---

## 5. Pellicules & Laboratoire Argentique

Dans **Carnet & Chambre Noire** > **🎞️ Pellicules** :

1. **Ajouter un film** : Renseignez la marque (*ex: Kodak*), le modèle (*ex: Tri-X 400*), les sensibilités nominale/exposée (ISO) et le format.
2. **Chimie par défaut** : Enregistrez votre recette de développement (révélateur, dilution, temps, température, agitation, push/pull et fixateur). Elle sera automatiquement appliquée à toutes les photos associées à cette pellicule.
3. **Planche-Contact Virtuelle** : Cliquez sur un rouleau pour voir sa grille de négatifs (36 vues, 12 vues, plan-film) et associez vos photos aux numéros de vues.

---

## 6. Projets & Paramètres Techniques des Photos

Dans chaque projet ou album, vous pouvez détailler les paramètres de chaque cliché :

* **Prise de vue** : Boîtier, objectif, ouverture (*f/2.8*), vitesse (*1/250s*), focale, filtres physiques et parasoleil.
* **Éclairage artificiel** : Si la lumière est définie sur *Artificielle* ou *Flash*, choisissez votre source (sélection rapide depuis votre matériel) et ajustez la puissance utilisée (**de `1/256` à `1/1`** ou valeur personnalisée).
* **Argentique & Chimie** : Pellicule rattachée et paramètres de développement personnalisables.

---

## 7. Partage & Intégration Externe (Iframe)

Chaque projet dispose d'un bouton **Partager** offrant :
* **Lien public direct** : Vers la page de votre projet dans la Chambre Noire.
* **Code d'intégration Iframe** : Un code HTML prêt à l'emploi (`/embed/project/:slug`) pour intégrer votre projet ou carnet sans barre de navigation sur un site tiers (WordPress, site personnel).

---

## 8. Aide-mémoire Markdown

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
