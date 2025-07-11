# Runnmate Landing Page

A Next.js web application for connecting runners and giving running shoes a second life.

## Features

- Strava integration for runner verification
- Secure token storage with encryption
- Email notifications via Resend
- Multi-language support (English/Dutch)
- Modern UI with Tailwind CSS

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials
   - Add your Strava API credentials
   - Add your Resend API key
   - Generate an encryption key:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - Add the generated key as `ENCRYPTION_KEY` in your `.env.local`

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

1. Run the migrations in your Supabase SQL editor:
   - `database/strava_verification_migration.sql`

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `STRAVA_CLIENT_ID`: Your Strava API client ID
- `STRAVA_CLIENT_SECRET`: Your Strava API client secret
- `RESEND_API_KEY`: Your Resend API key
- `ENCRYPTION_KEY`: 32-byte hex key for encrypting Strava tokens
- `NEXT_PUBLIC_SITE_URL`: Your site URL (for callbacks)

## Security

- Strava tokens are encrypted at rest using AES-256-GCM
- Row Level Security (RLS) policies protect user data
- Environment variables are properly handled
- API routes are protected against unauthorized access

## Development

- Built with Next.js 14
- TypeScript for type safety
- Tailwind CSS for styling
- Supabase for backend and authentication
- Strava API for runner verification
- Resend for transactional emails

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
