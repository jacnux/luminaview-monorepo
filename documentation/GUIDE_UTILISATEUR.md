# Guide Utilisateur - Écosystème LuminaView

Bienvenue dans le nouvel écosystème **LuminaView** !
Vos différentes applications ont été réunifiées sous un même toit pour vous offrir une expérience fluide, rapide, et centralisée.

Ce guide vous aide à naviguer et à gérer vos contenus à travers les différents modules.

---

## 1. Vos Applications (Points d'accès)

L'écosystème est divisé en 4 espaces connectés entre eux.

### 🏢 Le Manager (Tableau de bord central)
- **Accès** : `http://localhost:8080`
- **Utilité** : C'est votre tour de contrôle. Depuis cet espace, vous pouvez :
  - Gérer vos photos et vos albums LuminaView.
  - Gérer les utilisateurs et les accès.
  - Rédiger et publier vos articles de Blog.
  - Configurer vos pages de Portfolio.

### ✍️ Le Blog
- **Accès** : `http://localhost:8081` (ou `http://localhost:8081/?user=votre_pseudo`)
- **Utilité** : C'est la vitrine publique de vos actualités. Les visiteurs peuvent y lire vos articles, voir vos dernières nouveautés, et laisser des commentaires. Il intègre directement des liens vers votre Portfolio et vos carnets de route Chambre Noire.

### 🎨 Le Portfolio
- **Accès** : `http://localhost:8090`
- **Utilité** : L'espace d'exposition de vos meilleures photos. Il s'adapte aux thèmes visuels que vous définissez dans le Manager (Standard, Minimaliste, Sombre, etc.).

### 🎞️ La Chambre Noire
- **Accès** : `http://localhost:8082`
- **Utilité** : L'outil technique du photographe argentique. Cet espace vous permet de consigner vos pellicules (35mm, 120, plan-film), vos temps de développement, votre matériel (boîtiers, objectifs) et de générer de magnifiques "Carnets de Route" publics (Planches contacts).

---

## 2. Navigation Unifiée

Une grande nouveauté de cette architecture est la **navigation fluide**.
Auparavant, passer du Blog à la Chambre Noire ou au Portfolio ouvrait de nouveaux onglets qui s'accumulaient. Désormais :
- **Navigation interne** : Cliquer sur le menu "Portfolio" depuis le Blog (et vice-versa) changera simplement la page en cours, de façon instantanée.
- **Retour au Manager** : Vous disposez de liens rapides pour retourner éditer vos contenus.

---

## 3. Gestion de vos données

Toutes vos données sont désormais centralisées dans une base unique.

1. **Vos Images** : Que vous mettiez en ligne une photo dans un Album du Manager, dans un Article de Blog, ou dans un Carnet de Route de la Chambre Noire, **toutes vos images partagent le même espace sécurisé**.
2. **Vos Identifiants** : Plus besoin de vous connecter séparément. Le système vous reconnaît de manière globale.
3. **Le formatage (Chambre Noire)** : L'affichage des formats de vos pellicules (4x5, 9x12, 120, 35mm...) respecte scrupuleusement ce que vous saisissez. Finis les affichages par défaut forcés !

---

## 4. Partager vos contenus

Chaque module propose des options de partage public :
- **Un album LuminaView** : Générez un lien de partage depuis le Manager.
- **Un article de Blog** : Cliquez sur "Voir" depuis le gestionnaire du Blog, puis copiez l'URL.
- **Un Carnet de Route** : Dans la Chambre Noire, utilisez le bouton "Partager" sur un projet pour obtenir un code HTML ou un lien public à envoyer à vos proches.

*LuminaView est conçu pour grandir avec vous. Profitez de ce nouvel espace créatif unifié !*
