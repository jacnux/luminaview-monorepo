# Manuel Utilisateur — Chambre Noire

Ce document présente le fonctionnement de **Chambre Noire**, outil de gestion de matériel photo, de suivi de pellicules/plans-films, et de publication de carnets de routes techniques et artistiques.

---

## 1. Topologie & Navigation

Chambre Noire fonctionne comme le module public de mémoire technique de votre univers photographique LuminaView :

* **Consultation Publique** : Accessible sur `https://[votre-pseudo]-carnet.helioscope.fr` *(ou `http://localhost:7082/?user=[pseudo]` en développement local)*.
* **Gestion Privée (Studio)** : La création et la modification de votre matériel, vos pellicules et vos projets s'effectuent de façon sécurisée depuis **Lumina Studio** (`http://localhost:7080` ou `https://lumina.fr`).

---

## 2. Gérer son Matériel et ses Pellicules (Studio)

Pour documenter vos prises de vue, vous pouvez ajouter vos boîtiers, objectifs et rouleaux de films dans votre Studio.

### A. Inventaire du Matériel (Gear)
1. Dans le Studio, allez dans **Carnet & Chambre Noire** > **📷 Matériel Photo** puis cliquez sur **Ajouter un matériel**.
2. Renseignez le type (Boîtier ou Objectif), la marque, le modèle, le format supporté (135, 120, plan-film 4x5, etc.) et le numéro de série facultatif.
3. Ce matériel sera disponible pour être associé en un clic à vos photos ou rouleaux.

### B. Suivi des Pellicules & Plans-Films (Films)
1. Allez dans **🎞️ Pellicules** puis cliquez sur **Ajouter un film**.
2. Renseignez la marque (ex: *Kodak*), le modèle (ex: *Tri-X 400*), la sensibilité nominale (ex: *400*), la sensibilité exposée/utilisée (ex: *800* si vous poussez le film) et le format (135, 120, plan-film).
3. **Chimie par défaut** : Vous pouvez renseigner le révélateur et le fixateur par défaut pour ce rouleau (nom du produit, dilution, temps, température, agitation, push/pull). Ces informations seront héritées automatiquement pour chaque photo liée à ce rouleau.

### C. Planche-Contact Virtuelle
1. Cliquez sur une pellicule pour afficher sa **Planche-Contact**.
2. Chaque case représente une vue (Vue #1 à #36 ou plan-film).
3. Cliquez sur **Associer** pour lier une photo existante de votre galerie ou téléverser directement une nouvelle vue.

---

## 3. Le Carnet de Route et les Projets

Un **projet** correspond à une série, une sortie photo ou une thématique artistique.

1. Créez un projet dans **Projets** avec un titre, une description (Markdown supporté) et le statut de publication (Public / Masqué).
2. Associez vos photos au projet.
3. Chaque photo du projet peut disposer de ses propres réglages de prise de vue et de laboratoire, ou hériter directement de la pellicule associée.

---

## 4. Renseigner les paramètres d'une Photo

Dans un album ou un projet, vous pouvez éditer les métadonnées de chaque cliché :

### Prise de vue
* **Boîtier & Objectif** : À sélectionner parmi votre matériel enregistré.
* **Exposition** : Ouverture (ex: *f/8*), Vitesse (ex: *1/125*), Sensibilité spécifique (ex: *400*), Focale utilisée, type de filtre physique (ND, filtre couleur) et présence du parasoleil.

### Chimie & Labo (Argentique uniquement)
* **Pellicule** : Sélectionnez le rouleau ou plan-film associé.
* **Révélateur & Fixateur** : Renseignez le révélateur (produit, dilution, temps, température, agitation, push/pull) et le fixateur (produit, dilution, temps de fixage).

---

## 5. Intégrer son Carnet de Route (Embed Iframe)

Chambre Noire propose des adresses épurées, sans barre de navigation ni menus, parfaites pour être intégrées (via iframe) sur un autre site (WordPress, blog, portfolio personnel) :

* **Carnet de routes complet (Embed)** :
  ```html
  <iframe src="http://localhost:7082/embed/carnet-de-routes?user=jac" width="100%" height="700" frameborder="0"></iframe>
  ```
* **Projet spécifique (Embed)** :
  ```html
  <iframe src="http://localhost:7082/embed/project/slug?user=jac" width="100%" height="600" frameborder="0"></iframe>
  ```

---

## 6. Syntaxe Markdown acceptée

Les descriptions de profils, de projets et d'intentions de prise de vue acceptent le format Markdown enrichi :

```markdown
# Titre principal
## Sous-titre

**Texte important en gras**
* Élément de liste 1
* Élément de liste 2

![Légende](/uploads/nom-du-fichier.jpg)
[Visiter mon portfolio](https://jac.helioscope.fr)
```
