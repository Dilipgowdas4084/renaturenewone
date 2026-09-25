# Renature

Renature is a modern web application built with React and Vite. It uses Tailwind CSS for styling and is currently configured as a frontend-only project.

## Overview
This project is a website frontend for Renature, focused on UI development and styling. At the moment, it does not appear to be connected to a backend or database.

## Tech Stack
- React
- Vite
- JavaScript
- HTML/CSS
- Tailwind CSS

## Dependencies Used
The project currently uses the following packages:

### Core dependencies
```bash
npm install react react-dom
```

### Development dependencies
```bash
npm install -D vite @vitejs/plugin-react tailwindcss @tailwindcss/vite
```

## Installation
Open a terminal and run:

```bash
cd C:\Users\ksmri\renature\client
npm install
```

If you need to install the dependencies manually, use:

```bash
npm install react react-dom
npm install -D vite @vitejs/plugin-react tailwindcss @tailwindcss/vite
```

## How to Run
Start the development server:

```bash
cd C:\Users\ksmri\renature\client
npm run dev
```

Then open the local URL shown in the terminal, usually:

```bash
http://localhost:5173
```

## Production Build
To create a production build:

```bash
cd C:\Users\ksmri\renature\client
npm run build
```

To preview the production build:

```bash
cd C:\Users\ksmri\renature\client
npm run preview
```

## Database
Current status: No database is currently configured or being used in this project.

This project is currently frontend-only and does not have any database integration such as:
- MongoDB
- PostgreSQL
- MySQL
- Firebase
- Supabase

## Vite Configuration
The project is configured with Vite and Tailwind CSS in `vite.config.js`:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
});
```

## Project Structure
```text
renature/
├── client/
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── ...
├── README.md
└── ...
```

## Notes
- This project currently runs as a frontend React app.
- Tailwind CSS is enabled through the Vite plugin.
- If a backend or database is added later, update this README with:
  - backend framework
  - API setup
  - database engine
  - environment variables
  - database connection instructions

## Requirements
Make sure you have the following installed:
- Node.js 18 or newer
- npm

## License
No license has been added to the project yet.
