# Social Media Connect Application

## Description
This is a full-stack social media web application built using the MERN stack (MongoDB, Express.js, React.js, Node.js). It provides a secure and responsive environment for users to connect, manage profiles, search for others, and handle friend requests. The application emphasizes security through robust authentication flows (Access & Refresh Tokens) and offers a seamless user experience with optimized state management via Redux Toolkit.

Note: This project is not finished. It is open to contributions and new feature additions. The backend is fully production-ready, while the frontend is where contributions are most welcome. Requests and suggestions for new features are open for both backend and frontend improvements.

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (Database)
- Mongoose (ODM)
- JSON Web Token (JWT) for Authentication
- Bcrypt for Password Hashing
- Cloudinary (Image Storage)
- Multer (File Upload Middleware)
- Cookie Parser

### Frontend
- React.js (Vite)
- Redux Toolkit (State Management)
- React Router DOM
- Axios (API Requests with Interceptors)
- FontAwesome (Icons)
- CSS3 (Custom Responsive Styling)

## Key Features

### Authentication & Security
- Secure Login and Registration.
- JWT-based authentication using Access Tokens (short-lived) and Refresh Tokens (long-lived).
- HttpOnly Cookies for secure token storage.
- Axios Interceptors to handle silent token refreshing automatically.
- Secure Logout functionality that cleans up cookies and database sessions.

### User System
- Profile Management: Users can edit personal details and upload profile pictures.
- Search: Debounced search functionality to find other users by username or name.
- View Profiles: Visit other users' profiles to see their details.

### Friend System
- Send Friend Requests.
- Accept or Reject incoming requests.
- View list of current friends.
- Optimistic UI updates (instant visual feedback when accepting/rejecting without page reload).

### Notification Center
- Real-time fetching of unread notifications.
- Visual badges for unread counts.
- Interactions: Users can accept/reject friend requests directly from the notification panel.
- Management: Options to mark notifications as read, delete specific notifications, or clear all notifications at once.

## Installation & Setup

### Prerequisites
- Node.js installed on your machine.
- MongoDB Atlas account or local MongoDB instance.
- Cloudinary account for image hosting.

### 1. Backend Setup
1. Navigate to the server directory.
2. Install dependencies:
    ```bash
    npm install
    ```
3. Create a .env file in the root of the server directory with the following variables:

   ``` bash
   # Server
   PORT=5000

   # Client (CORS)
   CLIENT_URL=http://localhost:5173

   # Database
   MONGO_URI=your_mongodb_connection_string_here

   # JWT
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=20m
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=8d

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the client directory.
2. Install dependencies:
   npm install
3. Create a .env file in the root of the client directory with the following variable:
   ```bash
   # Frontend environment variables
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Architecture

The application uses a RESTful API structure with versioning (v1).
Few examples:
- /api/v1/user - Authentication, profile updates, and user search.
- /api/v1/friend - Sending, accepting, and rejecting friend requests.
- /api/v1/notification - Fetching, marking read, and deleting notifications.

## Project Structure
```bash
server/
├─ public/uploads      (temporary location for images)
├─ src/
│  ├─ controllers/       (Route logic)
│  ├─db/                 (MongoDB connection)
│  ├─ middlewares/       (Auth, error handling, multer, etc.)
│  ├─ models/            (Mongoose schemas)
│  ├─ routes/            (API endpoints)
│  ├─ app.js             (Express app setup)
│  ├─ index.js           (Server entry point)
│  └─ constants.js       (Stores Constants)
└─ utils/             (Helper functions, AsyncHandler)


client/
├─ src/
│  ├─ app/            (maintains store)
│  ├─ assets/         (Static images)
│  ├─ components/     (Reusable UI components)
│  ├─ css/            (Stylesheets)
│  ├─ features/       (Redux slices)
│  ├─ pages/          (Page components)
│  ├─ services/       (Axios instances, API requests)
│  ├─ App.jsx         (Main App component)
│  └─ main.jsx        (React entry point)
└─ vite.config.js      (Vite configuration)
```
