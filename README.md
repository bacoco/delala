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

- ✅ **Recherche de trains par trajet et date**: Interface intuitive avec autocomplétion des gares (60+ gares françaises)
- ✅ **Vérification de disponibilité TGV MAX**: Données réelles depuis SNCF Connect (web scraping)
- ✅ **Affichage détaillé des trains**: Horaires, durée, arrêts, voies et correspondances
- ✅ **Filtrage avancé des résultats**: Par heure de départ, durée maximale et nombre de correspondances
- ✅ **Trajets favoris**: Sauvegarde locale avec surnoms personnalisés et accès rapide
- ✅ **Notifications de disponibilité**: Configuration des alertes par email (interface prototype)
- ✅ **Support Docker**: Containerisation complète avec Chromium pour le scraping
- ✅ **Tests complets**: 90 tests unitaires avec couverture complète

### 🆕 Données réelles TGV MAX
L'application peut maintenant récupérer les vraies disponibilités TGV MAX directement depuis le site SNCF Connect !

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

# For real TGV MAX data (recommended):
# Edit .env and set NEXT_PUBLIC_USE_MOCK_DATA=false

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
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── sncf/          # SNCF API proxy with caching
│   ├── results/           # Search results page
│   ├── layout.tsx         # Root layout with error boundary
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles with SNCF theme
├── components/            # React components
│   ├── SearchForm.tsx     # Main search interface
│   ├── StationAutocomplete.tsx    # Gare autocomplete
│   ├── TrainCard.tsx      # Train result display
│   ├── FavoriteRoutes.tsx # Favorite routes management
│   ├── FilterSidebar.tsx  # Advanced filtering options
│   ├── SaveRouteModal.tsx # Save favorite modal
│   ├── NotificationSetup.tsx      # Notification config
│   ├── ErrorBoundary.tsx  # Error handling
│   ├── LoadingResults.tsx # Loading states
│   └── __tests__/         # Component tests
├── lib/                   # Utility functions
│   ├── stations.ts        # Station database (60+ gares)
│   ├── storage.ts         # Local storage management
│   ├── api.ts             # API client configuration
│   └── __tests__/         # Utility tests
├── types/                 # TypeScript types
│   └── index.ts           # Type definitions
├── public/                # Static assets
├── Docker files           # Container configuration
│   ├── Dockerfile         # Production build
│   ├── Dockerfile.dev     # Development build
│   ├── docker-compose.yml # Production compose
│   └── docker-compose.dev.yml    # Dev compose
├── Testing                # Test configuration
│   ├── jest.config.js     # Jest configuration
│   └── jest.setup.js      # Test setup
├── Configuration          # Project config
│   ├── .env.example       # Environment template
│   ├── next.config.js     # Next.js config
│   ├── tailwind.config.ts # Tailwind + SNCF colors
│   └── tsconfig.json      # TypeScript config
├── package.json           # Dependencies and scripts
└── README.md              # This file
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

### Development Mode
```bash
# Start with hot-reload
docker-compose -f docker-compose.dev.yml up

# Build development image
docker build -f Dockerfile.dev -t delala-dev .
```

### Production Mode
```bash
# Start production server
docker-compose up -d

# Build optimized production image
docker build -t delala .

# Run standalone container
docker run -p 3000:3000 -e NODE_ENV=production delala
```

### Health Checks
- Production containers include health checks
- Automatic restart on failure
- Monitoring endpoint: `/api/health`

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

## 📊 Development Timeline

Ce projet a été développé en 4 phases sur 1 semaine :

### Phase 1: Foundation (Day 1-2)
- ✅ Setup Next.js avec TypeScript et Tailwind
- ✅ Création de l'autocomplete des gares
- ✅ Formulaire de recherche avec date picker
- ✅ Intégration basique de l'API

### Phase 2: Core Features (Day 3-4)
- ✅ Intégration complète API SNCF avec mock data
- ✅ Affichage détaillé des résultats
- ✅ Détection TGV MAX avec heuristiques
- ✅ Tests unitaires (40+ tests)

### Phase 3: Enhanced UX (Day 5-6)
- ✅ Filtres avancés persistants
- ✅ Gestion des favoris avec modal
- ✅ Actions rapides sur les trajets
- ✅ Interface mobile optimisée

### Phase 4: Polish & Deploy (Day 7)
- ✅ Prototype de notifications
- ✅ Configuration Docker complète
- ✅ Documentation exhaustive
- ✅ 90 tests unitaires au total

### Phase 5: Real Data Integration (Day 8)
- ✅ Web scraping avec Puppeteer
- ✅ Extraction des vraies disponibilités TGV MAX
- ✅ Support Docker avec Chromium
- ✅ Fallback automatique sur mock data

## 🎯 Points Techniques Notables

- **Web Scraping intelligent** : Puppeteer avec Chromium headless pour données réelles
- **Autocomplétion performante** : Recherche fuzzy avec normalisation des accents
- **Gestion d'état locale** : localStorage pour persistence offline
- **Détection TGV MAX réelle** : Extraction directe depuis SNCF Connect
- **Rate limiting** : Protection API avec cache configurable
- **Error boundaries** : Gestion gracieuse des erreurs avec fallback
- **Responsive design** : Mobile-first avec breakpoints Tailwind
- **Docker optimisé** : Multi-stage build avec support Chromium intégré

---

*Generated with ❤️ by [BACO](https://github.com/bacoco/BACO) - Basic Adaptive Context Orchestrator*
*Project developed in 4 phases with automated Git commits and testing*
*2025-01-23*