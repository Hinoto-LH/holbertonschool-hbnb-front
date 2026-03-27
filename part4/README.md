# Projet Web - Partie 4 : Client Web Simple

Ce depot contient la quatrieme phase du projet, recue pour la conception et le developpement de l'interface utilisateur (front-end). L'objectif est de creer une application web interactive utilisant HTML5, CSS3 et JavaScript ES6 pour communiquer avec l'API back-end developpee precedemment.

## Objectifs du Projet

* Developper une interface conviviale respectant les specifications de design.
* Implementer les fonctionnalites client pour interagir avec l'API back-end.
* Assurer une gestion des donnees securisee et efficace via JavaScript.
* Appliquer les pratiques modernes du developpement web pour une application dynamique.

## Competences Acquises

* Maitrise de HTML5, CSS3 et JavaScript ES6 en conditions reelles.
* Interaction avec des services back-end via l'API Fetch (AJAX).
* Implementation de mecanismes d'authentification et gestion des sessions (JWT).
* Amelioration de l'experience utilisateur sans rechargement de page.

## Repartition des Taches

### 1. Design et Structure (Task 1)
* Finalisation des fichiers HTML et CSS pour correspondre aux maquettes.
* Creation des pages cles :
    - Connexion (Login)
    - Liste des lieux (List of Places)
    - Details d'un lieu (Place Details)
    - Ajout d'un avis (Add Review)

### 2. Authentification (Task 2)
* Implementation du formulaire de connexion connecte a l'API.
* Stockage du jeton JWT retourne par l'API dans un cookie pour la gestion de session.

### 3. Liste des Lieux (Task 3)
* Affichage dynamique de tous les lieux disponibles.
* Recuperation des donnees via l'API.
* Mise en place d'un filtre cote client par pays.
* Redirection automatique vers la page de connexion si l'utilisateur n'est pas authentifie.

### 4. Details du Lieu (Task 4)
* Affichage des informations detaillees d'un lieu specifique via son ID.
* Recuperation des donnees en temps reel depuis l'API.
* Affichage conditionnel du bouton d'ajout d'avis selon l'etat de connexion.

### 5. Ajout d'Avis (Task 5)
* Creation du formulaire de soumission d'avis.
* Securisation de l'acces : seuls les utilisateurs connectes peuvent acceder a cette page (redirection vers l'index pour les autres).

## Technologies Utisees

* HTML5 / CSS3
* JavaScript (ES6+)
* API Fetch pour les requetes HTTP
* Gestion des Cookies pour les sessions JWT

