# TGV MAX Checker

Une application web pour vérifier rapidement la disponibilité des places TGV MAX sur les trains SNCF.

## 🚀 Overview

Cette Web Application a été générée par BACO (Basic Adaptive Context Orchestrator) avec automatisation complète du développement. L'application permet aux abonnés TGV MAX de rechercher et vérifier la disponibilité des places sur leurs trajets préférés.

## 🛠️ Tech Stack

- **Next.js 14**: Framework React avec App Router pour une performance optimale
- **TypeScript**: Type safety et meilleure expérience développeur
- **Tailwind CSS**: Styling rapide et responsive design
- **Axios**: Client HTTP pour les appels API
- **React DatePicker**: Sélection de dates avec localisation française
- **date-fns**: Manipulation et formatage des dates

## ✨ Features

- ✅ **Recherche de trains par trajet et date**: Interface intuitive avec autocomplétion des gares
- ✅ **Vérification de disponibilité TGV MAX**: Indicateurs visuels clairs pour les places disponibles
- 🔧 **Affichage détaillé des trains**: Horaires, durée, arrêts, voies et correspondances
- 🔧 **Filtrage des résultats**: Par heure, durée et nombre de correspondances (à venir)
- 🔧 **Trajets favoris**: Sauvegarde locale des trajets fréquents
- 📋 **Notifications de disponibilité**: Alertes pour les places disponibles (prototype)

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/bacoco/delala.git
cd delala

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your SNCF API configuration

# Run development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm test            # Run test suite
npm run test:ci     # Run tests in CI mode
```

## 📁 Project Structure

```
delala/
├── app/              # Next.js app directory
│   ├── api/         # API routes
│   │   └── sncf/    # SNCF API proxy
│   ├── results/     # Search results page
│   ├── layout.tsx   # Root layout
│   ├── page.tsx     # Home page
│   └── globals.css  # Global styles
├── components/      # React components
│   ├── SearchForm.tsx
│   ├── StationAutocomplete.tsx
│   ├── TrainCard.tsx
│   ├── FavoriteRoutes.tsx
│   └── LoadingResults.tsx
├── lib/             # Utility functions
│   ├── stations.ts  # Station data and search
│   └── storage.ts   # Local storage utilities
├── types/           # TypeScript types
│   └── index.ts     # Type definitions
├── public/          # Static assets
├── .env.example     # Environment variables template
├── package.json     # Dependencies and scripts
└── README.md        # This file
```

## 🧪 Testing

This project includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 🔧 Configuration

Key configuration files:

- `.env` - Environment variables (API keys)
- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS avec couleurs SNCF
- `tsconfig.json` - TypeScript configuration

## 📝 Development Workflow

This project was set up with BACO's automated workflow:

- ✅ Automatic Git commits after each development phase
- ✅ Continuous GitHub integration
- ✅ Test files generated for all components
- ✅ Dependency management and conflict resolution
- ✅ Pre-commit test execution

## 🌐 API Integration

L'application utilise l'API SNCF pour récupérer les données des trains. Actuellement en mode prototype avec données mockées.

### Configuration API

1. Obtenez une clé API sur [SNCF Digital](https://numerique.sncf.com/startup/api/)
2. Ajoutez votre clé dans `.env`:
   ```
   SNCF_API_KEY=votre_cle_api
   SNCF_API_URL=https://api.sncf.com/v1/coverage/sncf
   ```

## 🐳 Docker Support

```bash
# Build Docker image
docker build -t delala .

# Run container
docker run -p 3000:3000 delala

# Using docker-compose
docker-compose up
```

## 📱 Mobile Optimization

- Touch-friendly interface (44px minimum tap targets)
- Responsive design pour tous les écrans
- Performance optimisée pour les réseaux mobiles
- Progressive loading des résultats

## 🔒 Security

- API keys protégés côté serveur
- Validation des entrées utilisateur
- Protection contre les injections
- HTTPS enforced en production

## 🚀 Deployment

L'application est prête pour le déploiement sur:

- Vercel (recommandé pour Next.js)
- Docker containers
- Node.js servers
- Serverless platforms

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Author

User

## 🙏 Acknowledgments

- SNCF pour l'accès aux données
- Communauté TGV MAX
- Next.js et Vercel teams

---

*Generated with ❤️ by [BACO](https://github.com/bacoco/BACO) on 2025-01-23*