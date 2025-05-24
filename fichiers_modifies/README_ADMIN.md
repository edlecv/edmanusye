# Documentation de la Vue Administrateur

## Introduction
Cette documentation explique les modifications apportées au site web pour ajouter une vue administrateur avec une quatrième page accessible uniquement après authentification.

## Mot de passe administrateur
**Mot de passe**: `Manus2025!`

## Fonctionnalités ajoutées
1. **Système d'authentification administrateur**
   - Bouton "Admin" dans la navigation pour ouvrir le formulaire de connexion
   - Formulaire modal de connexion avec vérification du mot de passe
   - Stockage de l'état de connexion dans localStorage pour persistance entre sessions

2. **Page d'administration**
   - Quatrième page accessible uniquement après authentification
   - Page actuellement vide (comme demandé)
   - Protection de la route avec redirection automatique vers la page d'accueil si non authentifié

3. **Navigation conditionnelle**
   - Lien vers la page d'administration visible uniquement après connexion
   - Bouton de déconnexion disponible après connexion

## Instructions d'utilisation
1. **Pour se connecter en tant qu'administrateur**:
   - Cliquez sur le bouton "Admin" en haut à droite de la navigation
   - Entrez le mot de passe `Manus2025!` dans le formulaire qui apparaît
   - Cliquez sur "Se connecter"

2. **Pour accéder à la page d'administration**:
   - Après connexion, un nouveau bouton "Administration" apparaît dans la navigation
   - Cliquez sur ce bouton pour accéder à la page d'administration

3. **Pour se déconnecter**:
   - Cliquez sur le bouton "Déconnexion Admin" qui remplace le bouton "Admin" après connexion

## Fichiers modifiés
- `src/App.jsx` - Mise à jour pour intégrer l'authentification et la nouvelle page
- `src/context/AuthContext.jsx` - Nouveau fichier pour gérer l'état d'authentification
- `src/components/LoginModal.jsx` - Nouveau composant pour le formulaire de connexion
- `src/components/AdminPage.jsx` - Nouveau composant pour la page d'administration (vide)
- `src/components/ProtectedAdminRoute.jsx` - Composant pour protéger l'accès à la page admin

## Notes techniques
- Le mot de passe est actuellement stocké en clair dans le code (pour ce prototype)
- En production, il faudrait implémenter une solution plus sécurisée (backend avec hachage)
- La page d'administration est prête à recevoir du contenu ultérieurement
