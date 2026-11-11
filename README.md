# Campused AI — Frontend

Angular frontend for **Campused AI**, an AI-assisted study product designed around exam-preparation and learning workflows. The interface includes authentication, study/chat experiences, exam selection, pricing and supporting product pages.

## Features visible in this frontend

- Authentication flows: login, signup, OTP verification, forgot/reset password and email verification
- Study assistant and chat interface
- File selection for study material (images, PDF, DOC/DOCX and text files in the chat UI)
- Exam-oriented learning pages for NEET, JEE, UPSC and other study goals
- Pricing and contact pages
- Social sign-in integration package
- RevenueCat web purchase integration package
- Shared authentication, API and chat state services

> This repository contains the frontend. Backend services, API availability, credentials and production configuration are managed separately.

## Tech stack

- Angular 19 (standalone components)
- TypeScript
- RxJS
- Bootstrap and ngx-bootstrap
- ngx-toastr
- Angular animations
- Jasmine and Karma test tooling
- Social login and RevenueCat client packages

## Requirements

- Node.js version compatible with the installed Angular 19 toolchain
- npm

## Getting started

```bash
git clone https://github.com/Aryan96250/campused-frontend.git
cd campused-frontend
npm ci
npm start
```

Open the local URL printed by Angular CLI (typically `http://localhost:4200`).

## Useful commands

| Command | Description |
| --- | --- |
| `npm start` | Run the development server |
| `npm run build` | Build the application |
| `npm test` | Run unit tests |
| `npm run watch` | Build in watch mode |

## Repository layout

```text
src/
├── app/
│   ├── helpers/       # Auth, guards, interceptors, API and shared services
│   └── pages/         # Authentication, chat, exams, home, pricing and contact
└── assets/            # Images and other static assets
```

## Configuration and security

- Configure API endpoints and third-party credentials for your own environment before running integrations.
- Never commit production secrets, access tokens, private keys or real user data.
- Review environment-specific configuration before deploying a fork.
- Third-party services may require separate provider-side setup.

## Testing

Run `npm test` for the configured Karma/Jasmine test suite and `npm run build` to validate a production build.

## Author

**Aryan Chauhan** · [GitHub](https://github.com/Aryan96250)
