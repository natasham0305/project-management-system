# Project Management System

A full-stack web application for managing projects, teams, tasks, and user access through a centralized project management platform.

The project follows a client-server architecture with a React frontend, Express.js backend, and PostgreSQL database. It also includes authentication, authorization, database migrations and seeders, API services, and end-to-end testing with Playwright.

---

## Features

### Authentication & Authorization

- User registration
- User login
- Authentication-based access
- Protected application resources
- Authorization for application operations

### Project Management

- Create and manage projects
- Organize project-related information
- Manage project activities

### Team Management

- Create and manage teams
- Organize users within projects
- Support team-based project workflows

### Task Management

- Create and manage tasks
- Organize tasks within projects
- Track project-related work

### Application

- Dashboard-based project management
- API-driven frontend and backend communication
- Database-backed application
- Reusable React components
- Centralized API services
- Authentication context
- End-to-end automated testing

---

## Tech Stack

### Frontend

- React
- JavaScript / JSX
- Vite
- HTML
- CSS

### Backend

- Node.js
- Express.js

### Database

- PostgreSQL

### Testing

- Playwright
- TypeScript

### Code Quality

- Oxlint

### Development & CI

- Git
- GitHub
- GitHub Actions

---

## Architecture

```text
                    ┌───────────────────┐
                    │       User        │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │  React Frontend   │
                    │   + Vite           │
                    └─────────┬─────────┘
                              │
                         HTTP / API
                              │
                              ▼
                    ┌───────────────────┐
                    │  Express Backend  │
                    │     Node.js       │
                    └─────────┬─────────┘
                              │
                    Database Queries
                              │
                              ▼
                    ┌───────────────────┐
                    │    PostgreSQL     │
                    └───────────────────┘

### Project Structure

project-management-system/
│
├── .github/
│   └── workflows/
│       └── ...                         # GitHub Actions workflows
│
├── client/
│   │
│   ├── src/
│   │   ├── components/                 # Reusable React components
│   │   ├── context/                    # Application context/state
│   │   ├── pages/                      # Application pages
│   │   ├── services/                   # API/service layer
│   │   ├── App.css                     # Application styles
│   │   ├── App.jsx                     # Root React component
│   │   ├── index.css                   # Global styles
│   │   └── main.jsx                    # React entry point
│   │
│   ├── tests/
│   │   ├── auth/                       # Authentication test utilities
│   │   ├── fixtures/                   # Playwright test fixtures
│   │   ├── helpers/                    # Test helper utilities
│   │   ├── pages/                      # Page objects / page test utilities
│   │   ├── auth.setup.ts               # Authentication test setup
│   │   ├── example.spec.ts             # Example end-to-end test
│   │   ├── login.spec.ts               # Login tests
│   │   ├── projects.spec.ts            # Project-related tests
│   │   └── register.spec.ts            # Registration tests
│   │
│   ├── .github/
│   │   └── workflows/
│   │
│   ├── .gitignore
│   ├── .oxlintrc.json                  # Oxlint configuration
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── playwright.config.ts             # Playwright configuration
│   └── vite.config.js                   # Vite configuration
│
├── server/
│   │
│   ├── config/                         # Server configuration
│   ├── controllers/                    # Request and business logic
│   ├── middleware/                     # Express middleware
│   ├── migrations/                     # Database migrations
│   ├── models/                         # Database models
│   ├── routes/                         # API routes
│   ├── seeders/                        # Database seed data
│   │
│   ├── db.js                           # Database connection
│   ├── server.js                       # Server entry point
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
├── .oxlintrc.json
├── README.md
└── ...

## Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- PostgreSQL
- Git

Check Node.js:

```bash
node --version
```

Check npm:

```bash
npm --version
```

Check Git:

```bash
git --version
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/natasham0305/project-management-system.git
```

Move into the project directory:

```bash
cd project-management-system
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Install Backend Dependencies

Open another terminal:

```bash
cd server
npm install
```

---

## Environment Configuration

The backend requires environment-specific configuration for services such as the PostgreSQL database and authentication.

Create the appropriate `.env` file according to the project's server configuration.

Example:

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secret_key
```

> **Note:** The exact environment variable names should match the configuration used by the project.

### Security

Never commit sensitive information such as:

- Database passwords
- JWT secrets
- API keys
- Private credentials
- Production secrets

Make sure `.env` files are included in `.gitignore`.

---

## Running the Application

### Start the Backend

From the server directory:

```bash
cd server
npm run dev
```

### Start the Frontend

Open another terminal:

```bash
cd client
npm run dev
```

Vite will provide the local development URL for the frontend.

---

## Testing Locally

The project includes automated end-to-end testing using **Playwright**.

From the client directory:

```bash
cd client
npm install
```

Run the Playwright test suite:

```bash
npx playwright test
```

### Run Tests with the Playwright UI

```bash
npx playwright test --ui
```

### Run a Specific Test File

```bash
npx playwright test tests/login.spec.ts
```

The test suite is organized under:

```text
client/tests/
├── auth/
├── fixtures/
├── helpers/
├── pages/
├── auth.setup.ts
├── example.spec.ts
├── login.spec.ts
├── projects.spec.ts
└── register.spec.ts
```

> **Note:** Use the project's configured npm test scripts when available.

---

## Code Quality

The project includes **Oxlint** configuration for maintaining code quality and identifying potential issues.

Configuration file:

```text
.oxlintrc.json
```

Run lint checks:

```bash
npm run lint
```

---

## Development Workflow

```text
        Feature / Bug
              │
              ▼
      Local Development
              │
              ▼
       Run Application
              │
              ▼
          Run Tests
              │
              ▼
       Run Lint Checks
              │
              ▼
       Review Changes
              │
              ▼
         Git Commit
              │
              ▼
          Git Push
              │
              ▼
        GitHub Actions
```

---

## Git Workflow

Check current changes:

```bash
git status
```

Review changes:

```bash
git diff
```

Stage changes:

```bash
git add .
```

Create a commit:

```bash
git commit -m "feat: describe your change"
```

Push changes:

```bash
git push
```

Create a feature branch:

```bash
git checkout -b feature/your-feature
```

---

## CI/CD

The repository contains GitHub Actions workflows under:

```text
.github/workflows/
```

GitHub Actions can automate:

- Dependency installation
- Linting
- Testing
- Build verification
- Continuous Integration checks

Automated checks help identify issues before changes are merged.

---

## Security Practices

The project includes:

- Authentication
- Authorization
- Environment variables
- Server-side validation
- Database-backed application logic
- Automated testing
- Separate frontend and backend architecture

Sensitive credentials should never be committed to source control.

---

## Future Improvements

- Project dashboard improvements
- Task status and priority management
- Project deadlines
- Search and filtering
- Notifications
- Improved responsive design
- More comprehensive test coverage
- API documentation
- Production deployment
- Performance monitoring
- Enhanced CI/CD pipeline
- Project analytics and reporting

---

## Contributing

Contributions are welcome.

### Development Process

1. Fork the repository.

2. Create a feature branch:

```bash
git checkout -b feature/your-feature
```

3. Make your changes.

4. Run the application locally.

5. Run the test suite.

6. Run lint checks.

7. Review your changes.

8. Commit your changes:

```bash
git commit -m "feat: add your feature"
```

9. Push your branch:

```bash
git push origin feature/your-feature
```

10. Open a Pull Request.

---

## Project Status

**Status:** Active Development

This project is being actively developed with improvements to frontend, backend, API functionality, authentication, project management features, and automated testing.

---

## Author

### Natasha Malviya

**BTech CSE Student | Web Development Learner**

GitHub:  
https://github.com/natasham0305

Repository:  
https://github.com/natasham0305/project-management-system

---

⭐ If you find this project useful, consider giving the repository a star.
