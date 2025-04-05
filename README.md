# tsd-planning-poker

Planning poker application for Technologies of Software Development

## Project Structure

```bash
planning-poker-app/
├── client/                  # Angular Frontend Application
│   ├── node_modules/        # Frontend dependencies (npm/Yarn)
│   ├── src/                 # Main source code for the frontend
│   │   ├── app/             # Core application module
│   │   │   ├── core/        # Singleton services, guards, interceptors
│   │   │   ├── features/    # Feature modules (e.g., game room, auth)
│   │   │   └── shared/      # Shared module: reusable components, pipes, directives
│   │   ├── assets/          # Static assets (images, fonts, etc.)
│   │   ├── environments/    # Environment config (dev, prod)
│   │   ├── styles/          # Global styles (Bootstrap/Tailwind)
│   │   ├── index.html       # Main HTML page
│   │   ├── main.ts          # Frontend entry point
│   │   └── polyfills.ts
│   ├── angular.json         # Angular CLI config
│   ├── jest.config.js       # Jest config for frontend tests
│   ├── package.json         # Frontend dependencies/scripts
│   ├── tailwind.config.js   # Tailwind CSS config
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   └── tsconfig.spec.json
│
├── server/                  # Express.js Backend Application
│   ├── node_modules/        # Backend dependencies (npm/Yarn)
│   ├── src/
│   │   ├── api/             # API route definitions
│   │   ├── config/          # Config files (DB, env)
│   │   ├── controllers/     # Request handlers
│   │   ├── middlewares/     # Custom middleware (auth, error handling)
│   │   ├── models/          # Mongoose models
│   │   ├── services/        # Business logic
│   │   ├── sockets/         # WebSocket setup
│   │   ├── utils/           # Utility functions
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Main server entry point
│   ├── tests/               # Backend tests (Jest)
│   ├── .env                 # Environment variables
│   ├── .env.example
│   ├── jest.config.js
│   └── package.json         # Backend dependencies/scripts
│
├── tests/                   # End-to-end tests (Selenium)
│   ├── config/
│   ├── page-objects/
│   ├── specs/
│   └── utils/
│
├── .gitignore
├── docker-compose.yml       # Optional Docker setup
├── Dockerfile.client
├── Dockerfile.server
└── README.md                # Project overview, setup instructions
```
