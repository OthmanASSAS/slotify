# Slotify - Plateforme de réservation de salle d'étude

Une application Next.js 15 moderne pour gérer les réservations de places dans une salle d'étude ou autres lieux.

## Fonctionnalités

### Pour les étudiants

- Visualisation des créneaux disponibles dans un calendrier hebdomadaire (8h-23h)
- Sélection multiple de créneaux consécutifs
- Réservation simple avec email (liste blanche)
- Code d'annulation unique (8 caractères alphanumériques majuscules)
- Annulation possible jusqu'à 24h avant le créneau
- Interface responsive, moderne et colorée avec design violet/purple
- Indicateurs visuels de disponibilité (vert/orange/rouge)

### Pour les administrateurs

- Connexion sécurisée avec authentification par cookie
- Dashboard avec statistiques en temps réel
- Gestion complète des créneaux horaires (création, activation/désactivation, suppression)
- Gestion de la liste blanche des emails autorisés avec protection
- Visualisation de toutes les réservations avec filtres (actives/annulées)
- Interface admin moderne avec design cohérent

## Technologies utilisées

- **Next.js 15** avec App Router et Turbopack
- **TypeScript** pour la sécurité du typage
- **Tailwind CSS v4** pour le style
- **Prisma** comme ORM
- **SQLite** pour la base de données (développement)
- **Zod** pour la validation des données
- **bcryptjs** pour le hashing des mots de passe
- **date-fns** pour la manipulation des dates
- **shadcn/ui** pour les composants UI
- **Vitest** pour les tests unitaires
- **Sonner** pour les notifications toast

## Installation et démarrage

### Prérequis

- Node.js 18+
- pnpm

### Installation

```bash
# Cloner le projet
cd slotify

# Installer les dépendances
pnpm install

# Initialiser la base de données
npx prisma migrate dev

# Seed la base de données avec des données de test
npx prisma db seed
```

### Démarrage du serveur de développement

```bash
pnpm dev
```

L'application sera disponible sur `http://localhost:3000`

### Lancer les tests

```bash
# Lancer tous les tests
pnpm test

# Mode watch (relance automatique)
pnpm test:watch

# Interface UI de Vitest
pnpm test:ui

# Avec couverture de code
pnpm test:coverage
```

## Licence

MIT
