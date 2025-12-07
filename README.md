# Clurian - Orchard Manager

A modern web application for managing fruit orchards, tracking tree health, and maintaining activity logs. Clurian helps farmers and orchard managers efficiently manage their crops with health monitoring, activity logging, and follow-up tracking systems.

## 🌳 Features

### Dashboard & Overview
- **Key Statistics**: View total trees, sick trees, and orchard status at a glance
- **Filter & Search**: Search by tree code or variety, filter by zones (A, B, C, etc.)
- **Tree List**: Card-based tree display with status indicators (healthy, sick, dead) and pagination
- **Multi-Orchard Support**: Manage multiple orchards and switch between them seamlessly

### Tree Management
- **Register Trees**: Add new trees with code, zone, type, variety, and planting date
- **Status Updates**: Track tree health status (Healthy, Sick, Dead, Archived)
- **Replanting System**: When a tree dies, automatically archive the old tree and create a new one with the same code

### Activity Logging
- **Individual Logs**: Record tree-specific activities (pest treatment, pruning, etc.)
- **Batch Logs**: Log activities across zones or entire orchard (fertilizing, spraying, etc.)
- **Follow-up Tracking**: Set follow-up dates for sick trees and track them in a dedicated dashboard

### Authentication
- **LINE Login Integration**: Secure authentication via LINE account
- **Session Management**: Powered by Better Auth

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** (App Router) - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Radix UI** - Accessible UI components
- **Lucide React** - Icons

### Backend & Database
- **Better Auth** - Authentication with LINE Login provider
- **Prisma** - ORM for type-safe database operations
- **PostgreSQL** - Production database
- **Server Actions & API Routes** - Backend logic

### Infrastructure
- **Docker & Docker Compose** - Local PostgreSQL database
- **ESLint** - Code linting

## 📋 Prerequisites

- **Node.js** (LTS version recommended)
- **Docker Desktop** - Required for running the local PostgreSQL database
- **npm** - Package manager

## 🚀 Getting Started

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd clurian
npm install
```

### 2. Set Up Environment Variables
Create a `.env.local` file in the root directory with required credentials:
```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/clurian

# Authentication (LINE Login)
BETTER_AUTH_SECRET=your-secret-key
LINE_CHANNEL_ID=your-line-channel-id
LINE_CHANNEL_SECRET=your-line-channel-secret
```

### 3. Start PostgreSQL Database
```bash
docker-compose up -d
```

### 4. Set Up the Database
```bash
npx prisma migrate dev
```

### 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📦 Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## 📚 Documentation

- **[Feature Documentation](./docs/feature.md)** - Detailed feature specifications (Thai)
- **[Database Schema](./docs/database.md)** - Database design and relationships
- **[Tech Stack Details](./docs/tech.md)** - In-depth technology information
- **[API Documentation](./docs/api.md)** - API endpoints and usage

## 📁 Project Structure

```
clurian/
├── app/                    # Next.js app directory
│   ├── api/               # API routes & authentication
│   ├── dashboard/         # Main dashboard page
│   ├── login/            # Login page
│   └── actions/          # Server actions
├── components/           # React components
│   ├── dashboard/        # Dashboard-specific components
│   ├── forms/            # Form components
│   ├── modals/           # Modal components
│   ├── pdf/              # PDF generation (QR codes)
│   ├── ui/               # Reusable UI components
│   └── providers/        # Context providers
├── lib/                  # Utilities and helpers
│   ├── domain/           # Business logic mappers
│   ├── errors/           # Error definitions
│   └── services/         # Service layer
├── prisma/               # Database schema and migrations
├── docs/                 # Documentation
└── public/               # Static assets
```

## 🔐 Authentication

The application uses **Better Auth** with LINE Login integration. Users can:
- Sign in with their LINE account
- Manage multiple orchards per account
- Maintain session security with token-based authentication

## 🗄️ Database

The application uses **PostgreSQL** with **Prisma ORM** for type-safe database operations.

### Key Models
- **User** - User accounts with Better Auth integration
- **Orchard** - User's orchard/farm with zones
- **Tree** - Individual trees with status tracking
- **ActivityLog** - Records of all tree care activities

### Run Migrations
```bash
# Create new migration
npx prisma migrate dev --name <migration-name>

# View database in Studio
npx prisma studio

# Reset database (development only)
npx prisma migrate reset
```

## 📝 Development Guidelines

- Use TypeScript for type safety
- Follow ESLint configuration for code quality
- Create components in appropriate subdirectories
- Use Server Actions for server-side logic
- Leverage Prisma for database queries

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Code passes ESLint checks
- TypeScript types are properly defined
- Components follow the existing structure
- Database changes include proper migrations

## 📄 License

This project is private and maintained by the Clurian team.
