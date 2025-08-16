# Dashboard Admin - Koora.com

## 🚀 Fonctionnalités

Le dashboard admin offre une interface complète pour gérer le contenu et les utilisateurs de la plateforme Koora.com.

### 🌍 Support Multilingue
- **Français** : Interface complète en français
- **Arabe** : Interface complète en arabe avec support RTL
- **Changement automatique** selon la langue sélectionnée dans l'application

### ✨ Fonctionnalités Principales

- **Vue d'ensemble** : Statistiques en temps réel et aperçu des activités
- **Gestion des News** : Créer, modifier, supprimer et publier des articles avec **upload d'images**
- **Gestion des Utilisateurs** : Voir et gérer tous les utilisateurs de la plateforme
- **Analytics** : Statistiques détaillées sur le contenu et les utilisateurs

## 🔐 Accès Admin

### Connexion
- **Email admin** : `admin@koora.com`
- **Mot de passe** : `admin123`

### Connexion Utilisateur Test
- **Email utilisateur** : `user@koora.com`
- **Mot de passe** : `user123`

## 🎯 Comment Utiliser

### 1. Connexion
1. Cliquez sur le bouton "Connexion" dans l'en-tête
2. Utilisez les identifiants admin ci-dessus
3. Ou utilisez les boutons "Admin Demo" / "User Demo" pour un accès rapide

### 2. Accès au Dashboard
- Une fois connecté en tant qu'admin, le bouton "Admin Panel" apparaît dans l'en-tête
- Cliquez dessus pour accéder au dashboard admin
- Seuls les utilisateurs avec le rôle "admin" peuvent voir ce bouton

### 3. Navigation
Le dashboard est organisé en 4 onglets principaux :

#### 📊 Vue d'ensemble
- Cartes de statistiques avec animations
- News récentes
- Utilisateurs actifs

#### 📰 Gestion News
- Créer de nouvelles news
- Modifier les news existantes
- Changer le statut (brouillon, publié, archivé)
- Supprimer des news

#### 👥 Utilisateurs
- Voir tous les utilisateurs
- Filtrer par rôle et statut
- Gérer les comptes utilisateurs

#### 📈 Analytics
- Statistiques des news par statut
- Répartition des utilisateurs par rôle
- Métriques de performance

## 🎨 Design et Animations

### Animations
- **Fade-in** : Apparition progressive des éléments
- **Hover effects** : Effets au survol des cartes et boutons
- **Transitions fluides** : Animations CSS pour une expérience utilisateur optimale
- **Responsive** : Adapté à tous les écrans

### Support Multilingue
- **Interface RTL** : Support complet de l'arabe avec mise en page adaptée
- **Traductions** : Tous les textes, boutons et messages sont traduits
- **Adaptation automatique** : L'interface s'adapte selon la langue sélectionnée

### Thème
- **Mode clair/sombre** : Support automatique du thème de l'application
- **Couleurs cohérentes** : Palette de couleurs teal/blue pour l'identité visuelle
- **Design moderne** : Interface utilisateur intuitive et esthétique

## 🛡️ Sécurité

### Protection des Routes
- **Authentification requise** : Seuls les utilisateurs connectés peuvent accéder
- **Rôle admin requis** : Seuls les administrateurs peuvent voir le dashboard
- **Redirection automatique** : Protection contre l'accès non autorisé

### Gestion des Sessions
- **LocalStorage** : Persistance de la session utilisateur
- **Déconnexion sécurisée** : Nettoyage des données de session
- **Validation des rôles** : Vérification continue des permissions

## 🔧 Configuration

### Variables d'Environnement
Aucune configuration spéciale requise - le système utilise des données mockées pour la démonstration.

### Personnalisation
- Modifiez les couleurs dans `src/styles/admin-dashboard.css`
- Ajustez les animations selon vos préférences
- Personnalisez les catégories de news dans le composant

## 📱 Responsive Design

Le dashboard s'adapte automatiquement à tous les écrans :
- **Desktop** : Interface complète avec toutes les fonctionnalités
- **Tablet** : Adaptation des grilles et espacements
- **Mobile** : Navigation optimisée et boutons adaptés

## 🚀 Développement

### Structure des Fichiers
```
src/
├── pages/
│   ├── AdminDashboard.tsx      # Page principale du dashboard
│   ├── Transfers.tsx           # Page des transferts (2025)
│   └── ...                     # Autres pages
├── components/
│   ├── AdminButton.tsx         # Bouton d'accès admin
│   ├── LoginModal.tsx          # Modal de connexion
│   ├── ProtectedRoute.tsx      # Protection des routes
│   ├── MatchDetails.tsx        # Détails des matchs avec temps
│   └── PlayerDetails.tsx       # Détails des joueurs
├── contexts/
│   └── AuthContext.tsx         # Gestion de l'authentification
└── styles/
    └── admin-dashboard.css     # Styles et animations
```

### Technologies Utilisées
- **React 18** : Framework principal
- **TypeScript** : Typage statique
- **Tailwind CSS** : Framework CSS utilitaire
- **Lucide React** : Icônes modernes
- **React Router** : Navigation et protection des routes

## 🎯 Prochaines Étapes

### Fonctionnalités à Ajouter
- [x] Upload d'images pour les news
- [x] Support multilingue (français/arabe)
- [x] Composants de détails des matchs et joueurs
- [x] Page des transferts 2025 avec mise à jour 24h
- [ ] Système de notifications en temps réel
- [ ] Export des données en CSV/PDF
- [ ] Gestion des permissions granulaires
- [ ] Audit trail des actions admin
- [ ] Intégration avec une vraie base de données

### Améliorations Techniques
- [ ] Tests unitaires et d'intégration
- [ ] Optimisation des performances
- [ ] Cache intelligent des données
- [ ] PWA (Progressive Web App)

## 📞 Support

Pour toute question ou problème :
1. Vérifiez que vous êtes connecté avec le bon compte admin
2. Assurez-vous que tous les composants sont correctement importés
3. Vérifiez la console du navigateur pour les erreurs JavaScript

---

## 🆕 Nouvelles Fonctionnalités

### 📱 Composants de Détails
- **MatchDetails** : Affichage complet des détails des matchs avec temps de début, statut et événements
- **PlayerDetails** : Profils détaillés des joueurs avec statistiques, carrière et informations personnelles

### ⚽ Page des Transferts 2025
- **Saison 2025** : Affichage spécifique des transferts de la saison 2025
- **Mise à jour 24h** : Indication claire que les données sont rafraîchies toutes les 24 heures
- **Filtrage par saison** : Possibilité de basculer entre 2024 et 2025

### 🖼️ Upload d'Images
- **Support complet** : Upload, prévisualisation et gestion des images dans les news
- **Formats supportés** : Tous les formats d'image courants
- **Interface intuitive** : Glisser-déposer et prévisualisation en temps réel

---

**Note** : Ce dashboard est une démonstration avec des données mockées. En production, remplacez les données simulées par de vraies API et une base de données.
