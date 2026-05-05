# Al-Shatibi - Restaurant Management System

A full-stack food ordering platform with separate applications for customers and administrators.

## Project Structure

```
alshatibi/
├── backend/           # Node.js + Express + SQLite API
├── customer-app/      # React + Vite customer-facing web app
└── admin-dashboard/   # React + Vite admin panel (in development)
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

## Local Setup Instructions

### Backend

```bash
cd backend
npm install
```

Configure environment variables by creating a `.env` file in the `backend` folder (see `.env.example`):

```
PORT=5000
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

Start the server:

```bash
npm start
```

The backend will use SQLite (database.sqlite) for data storage.

### Customer App

```bash
cd customer-app
npm install
npm run dev
```

Create a `.env` file based on `.env.example`:

```
VITE_API_URL=http://localhost:5000/api
```

### Admin Dashboard

```bash
cd admin-dashboard
npm install
npm run dev
```

## Deployment to Render

### Prerequisites
- GitHub repository with your code
- Render account (https://render.com)

### Steps to Deploy

1. **Connect your GitHub repository to Render:**
   - Go to https://render.com/dashboard
   - Click "New +" and select "Web Service"
   - Connect your GitHub account and select this repository

2. **Deploy using render.yaml:**
   - Render will automatically detect the `render.yaml` file
   - Configure the following services:

   **Backend Service:**
   - Name: `alshatibi-backend`
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Region: Frankfurt (or your preferred region)
   - Plan: Free (or paid if needed)

   **Frontend Service:**
   - Name: `alshatibi-frontend`
   - Environment: Static Site
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

3. **Set Environment Variables:**
   - Go to your backend service settings
   - Add `JWT_SECRET` (Render can generate this automatically)
   - `NODE_ENV=production` and `PORT=10000` are pre-configured

4. **Access Your Application:**
   - Backend: `https://alshatibi-backend.onrender.com`
   - Frontend: `https://alshatibi-frontend.onrender.com` (or your custom domain)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Menu Management
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create menu item (admin only)
- `PUT /api/menu/:id` - Update menu item (admin only)
- `DELETE /api/menu/:id` - Delete menu item (admin only)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status (admin only)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin only)

### Users
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/:id` - Update user (admin only)

### Health Check
- `GET /api/health` - Server health check

## Tech Stack

- **Backend:** Node.js, Express, Sequelize, SQLite, Socket.io
- **Customer App:** React, Vite, Tailwind CSS, Axios
- **Admin Dashboard:** React, Vite, Tailwind CSS (in development)
- **Deployment:** Render

## Features

- User authentication with JWT
- Real-time order updates with Socket.io
- Menu management system
- Order tracking
- Category management
- Responsive design with Tailwind CSS
- File uploads for menu items

## Database

The project uses SQLite database (`database.sqlite`) for local development. The database schema is automatically created and synced using Sequelize ORM.

### Models
- User - User accounts
- MenuItem - Menu items with options
- Category - Food categories
- Order - Customer orders
- OrderItem - Items in orders
- DeliveryDriver - Driver information

## Environment Variables

### Backend (.env)
```
PORT=5000                    # Server port
JWT_SECRET=secret_key        # JWT signing secret
NODE_ENV=production          # Environment mode
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api  # Backend API URL
```

## License

MIT

## Support

For issues and questions, please open an issue on GitHub or contact the development team.

