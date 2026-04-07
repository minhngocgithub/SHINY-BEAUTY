# Shiny Beauty - E-Commerce Platform

A comprehensive, full-stack e-commerce platform specialized in cosmetics and beauty products. Built with modern technologies and enterprise-grade architecture.

##  Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Performance & Optimization](#performance--optimization)

## Overview

Shiny Beauty is a modern, scalable e-commerce platform designed for cosmetics retail. The application provides a complete shopping experience with advanced features including real-time notifications, loyalty programs, campaign management, and comprehensive admin controls.

**Live Demo:** [Coming Soon]

## Key Features

### Customer Features

- **Product Management**
  - Advanced product search and filtering
  - Category and subcategory browsing
  - Product reviews and ratings
  - Wishlist functionality
  - Product bundles and combo deals
  - Featured and trending products

- **Shopping Experience**
  - Smart shopping cart with real-time updates
  - Multiple payment methods integration
  - Coupon and discount code system
  - Loyalty points and rewards program
  - Order tracking and history
  - Address management for multiple shipping locations

- **User Account**
  - Email and OAuth authentication (Google, Facebook, Twitter)
  - OTP verification for secure transactions
  - User profile management
  - Order history and status tracking
  - Wishlist and saved items
  - Real-time notifications

- **Interactive Features**
  - Product feedback and reviews
  - Rating system
  - Support ticket system for customer service
  - Real-time chat support
  - Email notifications for orders and promotions

### Admin Features

- **Dashboard & Analytics**
  - Comprehensive analytics dashboard
  - Sales reports and insights
  - Customer behavior tracking
  - Revenue and performance metrics
  - Inventory analytics

- **Product Management**
  - CRUD operations for products, categories, and subcategories
  - Bulk product import/export
  - Inventory management system
  - Product bundling tools
  - Featured product selection

- **Sales & Marketing**
  - Campaign management system
  - Sale program scheduler with automated activation/deactivation
  - Coupon generation and management
  - Discount rules and promotions
  - Loyalty program configuration

- **Order Management**
  - Order processing and fulfillment
  - Shipping management
  - Order status updates
  - Payment verification
  - Return and refund handling

- **Customer Service**
  - Support ticket management
  - Customer feedback review
  - User account management
  - Review moderation

###  Technical Features

- **Real-time Communication**
  - Socket.io integration for live updates
  - Real-time notifications
  - Live inventory updates
  - Order status updates

- **Performance Optimization**
  - Redis caching for frequently accessed data
  - Lazy loading and code splitting
  - Image optimization with Cloudinary
  - Database query optimization
  - Response compression

- **Security**
  - JWT-based authentication
  - Password encryption with Argon2/Bcrypt
  - Rate limiting to prevent abuse
  - Helmet.js for security headers
  - CORS configuration
  - Input validation and sanitization

- **Developer Experience**
  - Swagger API documentation
  - Comprehensive test coverage
  - Docker containerization
  - PM2 process management
  - Automated jobs and cron tasks
  - Error logging and monitoring

## 🛠️ Technology Stack

### Frontend
- **Framework:** Vue 3 (Composition API with `<script setup>`)
- **Build Tool:** Vite
- **State Management:** Pinia & Vuex
- **Routing:** Vue Router
- **UI Framework:** Tailwind CSS
- **UI Components:** 
  - Headless UI
  - Heroicons
  - Swiper (carousel)
  - Chart.js (analytics)
  - SweetAlert2 (notifications)
  - AOS (animations)
- **Form Validation:** Vee-Validate + Yup
- **Maps:** Google Maps API, Leaflet
- **Real-time:** Socket.io Client
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Cache:** Redis (ioredis)
- **Authentication:** 
  - Passport.js (Local, Google, Facebook, Twitter)
  - JWT (jsonwebtoken)
  - Argon2 & Bcrypt for password hashing
- **File Upload:** 
  - Multer
  - Cloudinary (cloud storage)
- **Real-time:** Socket.io with Redis Adapter
- **Email:** Nodemailer
- **Job Queue:** Bull (Redis-based)
- **Validation:** Joi
- **API Documentation:** Swagger
- **Testing:** Jest
- **Process Manager:** PM2
- **Security:** 
  - Helmet.js
  - Express Rate Limit
  - CORS
  - Crypto-js

### DevOps & Tools
- **Containerization:** Docker & Docker Compose
- **Database Management:** Mongo Express
- **Cache Management:** Redis Commander
- **Version Control:** Git
- **Package Manager:** npm
- **Scheduler:** node-cron

##  System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│   Vue 3 + Vite + Tailwind CSS + Pinia + Socket.io Client   │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS/WSS
┌─────────────────────┴───────────────────────────────────────┐
│                      API GATEWAY                             │
│         Express.js + Rate Limiting + Helmet                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼──────┐ ┌───▼──────┐ ┌───▼──────────┐
│  Controllers │ │ WebSocket │ │ Job Queue    │
│              │ │ Socket.io │ │ Bull         │
└───────┬──────┘ └───┬──────┘ └───┬──────────┘
        │            │            │
┌───────▼──────┐     │            │
│  Middleware  │     │            │
│ - Auth       │     │            │
│ - Validation │     │            │
└───────┬──────┘     │            │
        │            │            │
┌───────▼──────┐     │            │
│  Services    │◄────┴────────────┘
└───────┬──────┘
        │
    ┌───┴────┬──────────┐
    │        │          │
┌───▼───┐ ┌─▼──────┐ ┌─▼────────┐
│MongoDB│ │ Redis  │ │Cloudinary│
│       │ │ Cache  │ │  CDN     │
└───────┘ └────────┘ └──────────┘
```

### Key Architectural Patterns

- **MVC Architecture:** Separation of concerns with Models, Controllers, and Views
- **Service Layer:** Business logic encapsulation
- **Middleware Pipeline:** Request processing and validation
- **Repository Pattern:** Data access abstraction
- **Job Queue:** Background task processing
- **Caching Strategy:** Redis for session and data caching
- **Real-time Updates:** Socket.io with Redis adapter for horizontal scaling

##  Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker & Docker Compose (optional, for containerized setup)
- MongoDB (v7 or higher)
- Redis (v7 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Shiny Beauty/Comestic"
   ```

2. **Install Backend Dependencies**
   ```bash
   cd api
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Configuration**

   Create `.env` file in the `api` directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://admin:admin123@localhost:27017/shiny_beauty_dev?authSource=admin
   
   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379
   
   # JWT
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRES_IN=30d
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Email (Nodemailer)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   
   # OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret
   TWITTER_CONSUMER_KEY=your_twitter_key
   TWITTER_CONSUMER_SECRET=your_twitter_secret
   
   # Frontend URL
   CLIENT_URL=http://localhost:5173
   
   # Payment Gateway (if applicable)
   PAYMENT_API_KEY=your_payment_api_key
   ```

   Create `.env` file in the `client` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

### Running with Docker (Recommended)

1. **Start all services**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Access services:**
   - MongoDB: `localhost:27017`
   - Mongo Express: `http://localhost:8081` (admin/admin123)
   - Redis: `localhost:6379`
   - Redis Commander: `http://localhost:8082`

3. **Start Backend**
   ```bash
   cd api
   npm run serve
   ```

4. **Start Frontend**
   ```bash
   cd client
   npm run dev
   ```

### Running without Docker

1. **Start MongoDB and Redis manually**

2. **Start Backend**
   ```bash
   cd api
   npm run serve
   ```

3. **Start Frontend**
   ```bash
   cd client
   npm run dev
   ```

4. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`
   - API Documentation: `http://localhost:5000/api-docs`

### Database Seeding

```bash
cd api

# Setup categories
npm run setup-categories

# Import sample products
npm run import-products

# Seed reviews
npm run seed:reviews
```

## 📁 Project Structure

```
Shiny Beauty/Comestic/
├── api/                          # Backend API
│   ├── config/                   # Configuration files
│   │   ├── cloudinary.js        # Cloudinary setup
│   │   ├── redis.js             # Redis connection
│   │   ├── passport.js          # Auth strategies
│   │   ├── socket.js            # Socket.io setup
│   │   └── swagger.js           # API documentation
│   ├── controller/               # Request handlers
│   ├── middleware/               # Express middleware
│   ├── models/                   # Mongoose schemas
│   ├── routers/                  # API routes
│   ├── services/                 # Business logic
│   ├── validators/               # Input validation
│   ├── jobs/                     # Background jobs
│   ├── tests/                    # Test suites
│   ├── migrations/               # Database migrations
│   ├── seeders/                  # Database seeders
│   └── index.js                  # Entry point
│
├── client/                       # Frontend Application
│   ├── src/
│   │   ├── components/          # Vue components
│   │   ├── views/               # Page components
│   │   ├── stores/              # Pinia stores
│   │   ├── router/              # Vue Router config
│   │   ├── assets/              # Static assets
│   │   ├── utils/               # Utility functions
│   │   └── App.vue              # Root component
│   ├── public/                   # Public assets
│   └── index.html               # HTML template
│
└── docker-compose.dev.yml       # Docker configuration
```

## 📚 API Documentation

The API is fully documented using Swagger/OpenAPI specification.

**Access the documentation:**
- Development: `http://localhost:5000/api-docs`
- Production: `https://your-domain.com/api-docs`

### Main API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/facebook` - Facebook OAuth

#### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

#### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/cancel` - Cancel order

#### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove cart item

#### Reviews
- `GET /api/products/:id/reviews` - Get product reviews
- `POST /api/products/:id/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

*For complete API documentation, please refer to the Swagger UI.*

## 🧪 Testing

The project includes comprehensive test coverage using Jest.

### Running Tests

```bash
cd api

# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Coverage

- Unit Tests: Controllers, Services, Utilities
- Integration Tests: API endpoints, Database operations
- E2E Tests: Complete user workflows

## 🚢 Deployment

### Production Build

**Backend:**
```bash
cd api
npm install --production
```

**Frontend:**
```bash
cd client
npm run build
# Output will be in client/dist
```

### Deployment Options

1. **Traditional Hosting (VPS)**
   - Use PM2 for process management
   - Configure Nginx as reverse proxy
   - Set up SSL/TLS certificates

2. **Cloud Platforms**
   - AWS (EC2, ECS, or Elastic Beanstalk)
   - Google Cloud Platform
   - Azure
   - Heroku

3. **Container Orchestration**
   - Docker Swarm
   - Kubernetes

### PM2 Deployment

```bash
cd api
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## ⚡ Performance & Optimization

### Backend Optimizations

- **Caching Strategy:**
  - Redis caching for product listings, categories
  - Session management with Redis
  - Query result caching

- **Database Optimization:**
  - Indexed collections for faster queries
  - Aggregation pipelines for complex operations
  - Connection pooling

- **API Performance:**
  - Response compression
  - Rate limiting to prevent abuse
  - Pagination for large datasets
  - Field selection to minimize payload

### Frontend Optimizations

- **Build Optimizations:**
  - Code splitting and lazy loading
  - Tree shaking for smaller bundles
  - Asset optimization (images, fonts)

- **Runtime Performance:**
  - Virtual scrolling for large lists
  - Debouncing and throttling for events
  - Image lazy loading
  - Component-level code splitting

- **User Experience:**
  - Optimistic UI updates
  - Loading skeletons
  - Progressive Web App (PWA) features
  - Responsive design for all devices

## 👥 Contributing

This project is currently maintained as a portfolio project. For any questions or suggestions, please feel free to reach out.

##  License

This project is private and intended for portfolio demonstration purposes.

## Contact

For inquiries about this project, please contact:
- **Email:** [minhngocitcareer@gmail.com]
- **LinkedIn:** [www.linkedin.com/in/mngocne]
- **GitHub:** [https://github.com/minhngocgithub.com]

---

**Built with ❤️ for demonstration purposes**
