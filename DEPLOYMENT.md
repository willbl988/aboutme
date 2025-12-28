# Deployment Guide

This guide will help you deploy the Golf Tracker application to production with a PostgreSQL database.

## Prerequisites

- Node.js 18+ installed
- A PostgreSQL database (we recommend using a managed service like [Supabase](https://supabase.com), [Neon](https://neon.tech), or [Railway](https://railway.app))
- A hosting platform for Next.js (we recommend [Vercel](https://vercel.com))

## Step 1: Set Up PostgreSQL Database

### Option A: Using Supabase (Recommended - Free Tier Available)

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (it will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`)
5. Replace `[YOUR-PASSWORD]` with your database password

### Option B: Using Neon (Recommended - Free Tier Available)

1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project
3. Copy the connection string from the dashboard

### Option C: Using Railway

1. Go to [railway.app](https://railway.app) and create an account
2. Create a new PostgreSQL database
3. Copy the connection string from the database settings

## Step 2: Set Up Environment Variables

1. Create a `.env` file in the root of your project:

```bash
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
NODE_ENV="production"
```

Replace the `DATABASE_URL` with your actual database connection string.

## Step 3: Install Dependencies and Set Up Database

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed database with initial data
# You can create a seed script if needed
```

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Add `DATABASE_URL` environment variable
   - Add `NODE_ENV=production`

5. Redeploy to apply environment variables:
```bash
vercel --prod
```

### Option B: Deploy via GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in the Vercel project settings:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NODE_ENV`: `production`
4. Deploy

## Step 5: Run Database Migrations in Production

After deployment, you need to run migrations on your production database:

```bash
# Set your production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy
```

Or use Vercel's build command to run migrations automatically:

1. Go to Vercel project settings → Build & Development Settings
2. Add a build command:
```bash
npx prisma generate && npx prisma migrate deploy && next build
```

## Step 6: Set Up Prisma Studio (Optional)

To manage your database visually:

```bash
npx prisma studio
```

This will open a web interface at `http://localhost:5555` where you can view and edit your database.

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |

## Database Schema

The application uses the following main tables:

- **User**: Stores user accounts
- **Session**: Stores user sessions
- **Course**: Stores golf courses
- **Hole**: Stores hole information for each course
- **Round**: Stores golf rounds
- **RoundPlayer**: Stores players in each round
- **Score**: Stores scores for each hole/player combination

## Troubleshooting

### Database Connection Issues

- Verify your `DATABASE_URL` is correct
- Check if your database allows connections from your hosting provider's IP
- For Supabase/Neon, you may need to allow connections in the database settings

### Migration Issues

- Make sure you've run `npx prisma generate` before deploying
- Check that your database URL is accessible
- Verify you have the correct permissions on the database

### Build Issues

- Ensure all environment variables are set in your hosting platform
- Check that Prisma Client is generated: `npx prisma generate`
- Verify Node.js version matches (18+)

## Security Notes

- Never commit `.env` files to version control
- Use strong passwords for your database
- Enable SSL connections for production databases
- Regularly update dependencies
- Use environment variables for all sensitive data

## Next Steps

1. Set up a custom domain (optional)
2. Configure SSL certificates (usually automatic with Vercel)
3. Set up monitoring and error tracking
4. Configure backups for your database
5. Set up automated deployments from your Git repository

## Support

For issues or questions:
- Check the [Prisma documentation](https://www.prisma.io/docs)
- Check the [Next.js documentation](https://nextjs.org/docs)
- Check the [Vercel documentation](https://vercel.com/docs)

