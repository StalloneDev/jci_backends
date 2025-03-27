# JCI Plateforme

Plateforme de gestion pour la Jeune Chambre Internationale (JCI), permettant la gestion des membres, des commissions, des formations et des réunions.

## 🚀 Fonctionnalités

### Gestion des Membres
- Inscription et validation des nouveaux membres
- Profils détaillés avec informations personnelles
- Gestion des cotisations

### Gestion des Mandats
- Suivi complet des mandats des membres
- Visualisation chronologique des mandats
- Statistiques et analyses détaillées
- Système de notification pour les mandats expirants
- Export des données en PDF et Excel
- Filtres avancés pour la recherche

### Gestion des Commissions
  - Création et suivi des commissions
  - Attribution des membres
  - Suivi des activités

### Gestion des Formations
  - Planification des formations
  - Inscription des participants
  - Suivi des présences
  - Export des attestations

### Gestion des Réunions
  - Planification des réunions
  - Gestion des ordres du jour
  - Suivi des présences
  - Procès-verbaux

## 🛠 Technologies

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- Shadcn/ui
- React Hook Form
- Zod
- Zustand
- Lucide Icons

### Backend
- Node.js
- Express
- Sequelize
- PostgreSQL
- JWT Authentication

## 📦 Installation

1. **Cloner le dépôt**
```bash
git clone https://github.com/votre-organisation/jci-plateforme.git
cd jci-plateforme
```

2. **Installer les dépendances**
```bash
# Frontend
cd jci_frontend
npm install

# Backend
cd ../jci_backend
npm install
```

3. **Configuration**
```bash
# Frontend
cp .env.example .env.local

# Backend
cp .env.example .env
```

4. **Démarrer les serveurs**
```bash
# Frontend
cd jci_frontend
npm run dev

# Backend
cd ../jci_backend
npm run dev
```

## 🏗 Structure du projet

```
jci_plateforme/
├── jci_frontend/           # Application React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilitaires et configurations
│   │   ├── pages/         # Pages de l'application
│   │   ├── types/         # Types TypeScript
│   │   └── tests/         # Tests unitaires et d'intégration
│   └── public/            # Fichiers statiques
│
└── jci_backend/           # Serveur Express
    ├── src/
    │   ├── controllers/   # Contrôleurs
    │   ├── models/        # Modèles Sequelize
    │   ├── routes/        # Routes API
    │   ├── middleware/    # Middleware personnalisé
    │   └── utils/         # Utilitaires
    └── tests/             # Tests
```

## 📝 Documentation API

La documentation complète de l'API est disponible à l'adresse suivante :
`http://localhost:3000/api-docs`

## 🧪 Tests

```bash
# Frontend
cd jci_frontend
npm run test

# Backend
cd ../jci_backend
npm run test
```

## 🔒 Sécurité

- Authentification JWT
- Validation des données avec Zod
- Protection CSRF
- Rate limiting
- Gestion fine des permissions

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'feat: add amazing feature'`)
4. Push la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Équipe

- [Nom du développeur] - Développeur principal
- [Nom du designer] - Designer UI/UX
- [Nom du PM] - Chef de projet

## 📞 Support

Pour toute question ou problème, veuillez :
1. Consulter la [documentation](docs/)
2. Ouvrir une [issue](issues/)
3. Contacter l'équipe à support@jci-plateforme.org

## Nouvelles Fonctionnalités (Janvier 2025)

### Timeline des Mandats
La plateforme propose maintenant une visualisation chronologique interactive des mandats. Cette timeline permet de :
- Visualiser l'historique complet des mandats d'un membre
- Identifier rapidement les périodes d'activité
- Repérer les chevauchements éventuels

### Statistiques et Analyses
Un nouveau tableau de bord statistique offre :
- Répartition des mandats par rôle
- Proportion de mandats actifs/inactifs
- Durée moyenne des mandats
- Visualisations graphiques (diagrammes en barres et camemberts)

### Filtres Avancés
L'interface de recherche a été enrichie avec :
- Recherche textuelle
- Filtrage par statut (actif/inactif)
- Sélection de plages de dates
- Réinitialisation rapide des filtres

### Export de Données
Nouvelles options d'export :
- Export PDF des mandats
- Export Excel pour analyse approfondie
- Personnalisation des exports

### Système de Notifications
Mise en place d'alertes pour :
- Mandats arrivant à expiration
- Chevauchements de mandats
- Rappels importants
