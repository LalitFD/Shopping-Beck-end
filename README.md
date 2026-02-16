# Major Project

This repository contains the source code for the Major Project, split into a `Beckend` (Node.js/Express) and `frontend` (React).

## Prerequisites

- Node.js (v18+ recommended)
- MongoDB (running locally or a cloud instance)

## Setup

### Backend

1. Navigate to the `Beckend` directory:
   ```bash
   cd Beckend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *Update the `.env` file with your MongoDB URI and other secrets.*

4. Start the server:
   - **Production:** `npm start`
   - **Development:** `npm run dev`

### Frontend

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. The project is configured to use `http://localhost:3000` as the API URL by default. To change this, edit the `.env` file:
   ```env
   REACT_APP_API_URL=http://your-api-url
   ```

4. Start the application:
   ```bash
   npm start
   ```

## Folder Structure

- **Beckend:** Contains the Node.js/Express API.
- **frontend:** Contains the React application.
