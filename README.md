# MindBloom - Track Habits, Journal Your Thoughts, Bloom

A full-stack web application built with Next.js, TypeScript, Tailwind CSS, and Prisma.

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with CSS-in-JS utilities
- **Form Management**: React Hook Form, Zod for validation
- **UI Components**: shadcn/ui with Radix UI

## Project Structure

```
src/
├── app/                 # Next.js app router pages and layouts
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard and main app
│   ├── habits/         # Habits tracking
│   ├── journal/        # Journal entries
│   └── settings/       # User settings
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   └── shared/        # Shared components
├── features/          # Feature-specific logic
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── server/            # Server-side logic
├── styles/            # Global styles
└── types/             # TypeScript type definitions

prisma/
└── schema.prisma      # Database schema

public/                # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database URL and other configs
   ```

3. **Set up the database**:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations

## Features

- 🔐 User authentication
- 📊 Habit tracking and analytics
- 📔 Journal entries with mood tracking
- 📈 Progress visualization
- ⚙️ User settings and preferences
- 🎨 Beautiful, responsive UI with shadcn/ui

## Development

### Adding UI Components

To add shadcn/ui components, they can be manually added to `src/components/ui/` following the shadcn/ui patterns.

### Database Schema

Edit `prisma/schema.prisma` to modify your database schema, then run:

```bash
npm run prisma:migrate
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

## License

MIT
