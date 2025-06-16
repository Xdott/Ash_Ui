# Xdott Contact Intelligence

A professional contact discovery and validation platform powered by AI, built with Next.js 14 and Auth0 authentication.

## Features

- **Contact Finder**: Find contact information by name and company with AI-powered insights
- **Company Finder**: Discover comprehensive company information and funding details
- **Email Validator**: Verify email addresses with detailed deliverability analysis
- **Phone Validator**: Validate phone numbers and get carrier information
- **Usage Reports**: Track validation usage and view detailed analytics
- **Auth0 Integration**: Secure authentication and user management

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Authentication**: Auth0
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Auth0 account
- Backend API server (configure API_URL)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd xdott-contact-intelligence
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
Create a `.env.local` file in the root directory:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_AUTH0_DOMAIN=your-auth0-domain.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your-auth0-client-id
\`\`\`

4. Configure Auth0:
   - Create an Auth0 application
   - Set allowed callback URLs to `http://localhost:3000/api/auth/callback`
   - Set allowed logout URLs to `http://localhost:3000`
   - Copy your domain and client ID to the environment variables

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
├── app/                    # Next.js App Router pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth-provider.tsx # Auth0 provider wrapper
│   ├── auth-guard.tsx    # Protected route component
│   └── ...               # Feature components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── public/               # Static assets
└── ...                   # Config files
\`\`\`

## Key Components

- **AuthProvider**: Wraps the app with Auth0 authentication
- **AuthGuard**: Protects routes requiring authentication
- **AppLayout**: Main layout with navigation and user management
- **Contact Finder**: Search for professional contacts
- **Company Finder**: Discover company information
- **Email/Phone Validators**: Validate contact information
- **Reports**: Usage analytics and statistics

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_AUTH0_DOMAIN`
   - `NEXT_PUBLIC_AUTH0_CLIENT_ID`
4. Deploy

### Other Platforms

1. Build the application:
\`\`\`bash
npm run build
\`\`\`

2. Start the production server:
\`\`\`bash
npm start
\`\`\`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | Yes |
| `NEXT_PUBLIC_AUTH0_DOMAIN` | Auth0 domain | Yes |
| `NEXT_PUBLIC_AUTH0_CLIENT_ID` | Auth0 client ID | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For support and questions, please contact the development team.
