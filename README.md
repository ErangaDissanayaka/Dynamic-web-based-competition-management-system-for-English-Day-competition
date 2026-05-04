# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Backend added

This project now includes an Express backend in `backend/server.js` using MongoDB via Mongoose.

## Project structure

- Frontend app files are in `frontend/` (Vite, React source, Tailwind, tests).
- Backend API files are in `backend/` (Express, Mongoose, seed logic).

### Run frontend + backend together

```sh
npm install
npm run dev:full
```

Frontend runs on `http://localhost:8080` and backend runs on `http://localhost:4000`.

### Run only frontend

```sh
npm run dev
```

### Configure MongoDB

1. Create a `.env` file in the project root.
2. Set your MongoDB connection string.

```sh
MONGODB_URI=mongodb://127.0.0.1:27017/school_sparkle
PORT=4000
```

You can use local MongoDB or MongoDB Atlas.

### Configure event notification email

If you want schools, students, and judges to receive an email when an admin creates a new event, add SMTP settings to the root `.env` file.

Example with Gmail app password:

```sh
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="English Day <your_email@gmail.com>"
```

Or use a full SMTP URL:

```sh
SMTP_URL=smtps://username:password@smtp.gmail.com:465
EMAIL_FROM="English Day <your_email@gmail.com>"
```

If SMTP is not configured, event creation still works, but notification emails are skipped.

### Run only backend

```sh
npm run dev:server
```

### Main API routes

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/schools`
- `PATCH /api/schools/:schoolId/approve`
- `DELETE /api/schools/:schoolId`
- `GET /api/events`
- `POST /api/events`
- `PATCH /api/events/:eventId/status`
- `GET /api/students`
- `POST /api/students`
- `DELETE /api/students/:studentId`
- `GET /api/scores`
- `POST /api/scores`
- `GET /api/leaderboard?eventId=e3&category=oratory`

Notes:

- Data is persisted in MongoDB.
- The backend auto-seeds demo data the first time each collection is empty.
- Vite is configured to proxy `/api` requests to `http://localhost:4000` in development.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
