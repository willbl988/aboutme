# Golf Tracker

A modern, real-time golf round tracking application built with Next.js, React, Tailwind CSS, and PostgreSQL. Track scores for multiple players simultaneously during a round.

## Features

- 🔐 **Authentication** - Secure login and registration system with password hashing
- 🏌️ **Course Management** - Create and manage golf courses with custom hole configurations
- 📊 **Round Tracking** - Start rounds with multiple players
- ⚡ **Real-time Scores** - Live score updates for all players
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🗄️ **Database Backed** - PostgreSQL database with Prisma ORM

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Authentication**: Session-based with bcrypt password hashing
- **Font**: Inter (Google Fonts)

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL database (local or cloud)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd aboutme
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your database connection string:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/golf_tracker?schema=public"
NODE_ENV="development"
```

4. Set up the database:
```bash
# Generate Prisma Client
npm run db:generate

# Run database migrations
npm run db:migrate
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

7. Register a new account or use an existing one to start tracking rounds!

## Database Setup

### Local PostgreSQL

If you have PostgreSQL installed locally:

```bash
# Create database
createdb golf_tracker

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/golf_tracker?schema=public"
```

### Cloud Database (Recommended for Production)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for instructions on setting up:
- Supabase (free tier available)
- Neon (free tier available)
- Railway
- Other PostgreSQL providers

## Project Structure

```
aboutme/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── courses/       # Course management endpoints
│   │   └── rounds/        # Round management endpoints
│   ├── courses/           # Courses page
│   ├── rounds/            # Rounds pages
│   │   ├── new/           # New round creation
│   │   └── [id]/          # Round detail/score entry
│   ├── login/             # Login page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Navigation.tsx     # Navigation bar
│   └── Footer.tsx         # Footer component
├── lib/                   # Utility libraries
│   ├── db.ts              # Prisma client
│   ├── auth-db.ts         # Database-backed authentication
│   └── golf-data-db.ts    # Database-backed golf data
├── prisma/                # Prisma schema and migrations
│   └── schema.prisma      # Database schema
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── next.config.js         # Next.js configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Usage

### Creating a Course

1. Navigate to the **Courses** page
2. Click **+ Add Course**
3. Enter the course name
4. Configure par for each hole (default is 4)
5. Click **Create Course**

### Starting a Round

1. Navigate to **Rounds** → **New Round**
2. Select a course
3. Add players (at least one required)
4. Click **Start Round**

### Entering Scores

1. Open an active round
2. Enter scores for each hole and player
3. Scores update automatically for all players in real-time
4. View total scores at the top of the page
5. Click **Complete Round** when finished

## Database Schema

The application uses the following main tables:

- **User**: Stores user accounts with hashed passwords
- **Session**: Stores user sessions with expiration
- **Course**: Stores golf courses
- **Hole**: Stores hole information for each course
- **Round**: Stores golf rounds
- **RoundPlayer**: Stores players in each round
- **Score**: Stores scores for each hole/player combination

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick deployment steps:
1. Set up a PostgreSQL database (Supabase, Neon, or Railway)
2. Set environment variables
3. Run migrations: `npx prisma migrate deploy`
4. Deploy to Vercel or your preferred hosting platform

## Security

- Passwords are hashed using bcrypt
- Sessions expire after 7 days
- SQL injection protection via Prisma
- Environment variables for sensitive data
- HTTPS in production (automatic with Vercel)

## Future Enhancements

- User registration page
- Round history and statistics
- Handicap calculations
- Course ratings and slope
- Social features (share rounds, leaderboards)
- Email notifications
- Mobile app

## License

This project is open source and available under the MIT License.

---

Built with ❤️ using Next.js, Prisma, and PostgreSQL
