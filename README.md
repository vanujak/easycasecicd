# EasyCase

EasyCase is a full-stack web application designed to streamline case management for legal professionals. It provides a user-friendly interface to manage clients, cases, and hearings.

## Technologies Used

### Frontend

*   **React:** A JavaScript library for building user interfaces.
*   **Vite:** A fast build tool and development server for modern web projects.
*   **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
*   **React Router:** For handling client-side routing.

### Backend

*   **Node.js:** A JavaScript runtime environment for server-side development.
*   **Express:** A minimal and flexible Node.js web application framework.
*   **MongoDB:** A NoSQL database for storing application data.
*   **Mongoose:** An ODM (Object Data Modeling) library for MongoDB and Node.js.
*   **JWT (JSON Web Tokens):** For secure user authentication.

## Getting Started

### Prerequisites

*   Node.js (v14 or later)
*   npm (Node Package Manager)
*   MongoDB (Make sure you have a running instance of MongoDB)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/easycase.git
    cd easycase
    ```

2.  **Install backend dependencies:**

    ```bash
    cd backend
    npm install
    ```

3.  **Install frontend dependencies:**

    ```bash
    cd ../frontend
    npm install
    ```

### Configuration

1.  **Backend:**
    *   Create a `.env` file in the `backend` directory.
    *   Add the following environment variables:
        ```
        PORT=5000
        MONGO_URI=your_mongodb_connection_string
        JWT_SECRET=your_jwt_secret
        ```

## Available Scripts

### Backend

To run the backend server in development mode (with hot-reloading):

```bash
cd backend
npm run dev
```

To start the backend server for production:

```bash
cd backend
npm start
```

The backend server will be running on `http://localhost:5000`.

### Frontend

To run the frontend development server:

```bash
cd frontend
npm run dev
```

The frontend development server will be running on `http://localhost:5173`.

To build the frontend for production:

```bash
cd frontend
npm run build
```

To preview the production build:

```bash
cd frontend
npm run preview
```
