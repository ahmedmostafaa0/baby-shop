# Baby Shop - Full Stack E-Commerce Platform

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)

A modern, full-stack e-commerce platform specialized for baby products with comprehensive admin dashboard, secure payment processing, and intuitive user interface.

[Live Demo](#) • [Admin Panel](#) • [Report Bug](https://github.com/ahmedmostafaa0/baby-shop/issues) • [Request Feature](https://github.com/ahmedmostafaa0/baby-shop/issues)

</div>

---

## 📋 Table of Contents

- [About The Project](#about-the-project)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Project](#running-the-project)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Architecture](#project-architecture)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🎯 About The Project

Baby Shop is a comprehensive e-commerce platform designed specifically for selling baby products. The platform provides a seamless shopping experience for customers while offering powerful management tools for administrators. Built with modern technologies, it emphasizes performance, security, and user experience.

### Project Goals

- 🛍️ Provide a smooth, intuitive shopping experience
- 👨‍💼 Enable efficient product and order management for admins
- 🔒 Ensure secure payment processing and data protection
- 📊 Deliver real-time analytics and business insights
- ⚡ Maintain high performance and scalability

---

## ✨ Key Features

### For Customers

- 🏪 **Product Browsing**: Browse baby products by categories and brands
- 🔍 **Advanced Search**: Search and filter products efficiently
- 🛒 **Shopping Cart**: Add/remove items, manage quantities
- ❤️ **Wishlist**: Save favorite products for later
- 💳 **Secure Checkout**: Stripe-powered payment processing
- 📦 **Order Management**: Track orders and view order history
- 👤 **User Accounts**: Create accounts, manage profile and addresses
- 🎯 **Product Reviews**: Leave reviews and ratings
- 📱 **Responsive Design**: Optimized for all devices

### For Administrators

- 📊 **Dashboard Analytics**: Real-time sales and traffic statistics
- 📦 **Product Management**: Create, edit, and manage product inventory
- 🏷️ **Category & Brand Management**: Organize product catalog
- 🎨 **Banner Management**: Manage promotional banners
- 👥 **User Management**: Manage customer accounts and roles
- 📋 **Order Management**: Process and track orders
- 📄 **Invoice Generation**: Export invoices as PDF
- 📊 **Analytics Reports**: Detailed business analytics
- 📤 **Bulk Upload**: Excel-based product upload

---

## 🛠️ Tech Stack

### Frontend - Customer Portal (Next.js)

- **Framework**: [Next.js 16](https://nextjs.org/) - React framework with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Payment**: [Stripe.js](https://stripe.com/docs/js)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

### Admin Dashboard

- **Build Tool**: [Vite](https://vitejs.dev/)
- **Framework**: React 19
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Routing**: [React Router](https://reactrouter.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Charts**: [Recharts](https://recharts.org/)
- **Export**: [html2canvas](https://html2canvas.hertzen.com/) + [jsPDF](https://github.com/parallax/jsPDF)
- **Spreadsheet**: [XLSX](https://sheetjs.com/)

### Backend - API Server (Express.js)

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js 5](https://expressjs.com/)
- **Language**: TypeScript
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose ODM](https://mongoosejs.com/)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: [bcrypt](https://github.com/kelektiv/node.bcrypt.js) for password hashing
- **File Upload**: [Multer](https://github.com/expressjs/multer) + [Cloudinary](https://cloudinary.com/)
- **Email**: [Nodemailer](https://nodemailer.com/)
- **Payment**: [Stripe API](https://stripe.com/)
- **API Docs**: [Swagger UI Express](https://github.com/scottie1984/swagger-ui-express)
- **Async Handling**: [express-async-handler](https://github.com/Abourass/express-async-handler)
- **CORS**: Express CORS middleware
- **ENV**: [dotenv](https://github.com/motdotla/dotenv)

---

## 📁 Project Structure

```
baby-shop/
├── admin/                          # Admin Dashboard (Vite + React)
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/                 # Admin pages (Dashboard, Products, Orders, etc.)
│   │   ├── store/                 # Zustand store for state management
│   │   ├── lib/                   # Utilities and configurations
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── client/                         # Customer Portal (Next.js)
│   ├── app/
│   │   ├── page.tsx              # Homepage
│   │   ├── api/                  # API routes
│   │   ├── auth/                 # Authentication pages
│   │   ├── product/              # Product detail page
│   │   ├── shop/                 # Shop page
│   │   └── user/                 # User profile
│   ├── components/               # Reusable components
│   ├── hooks/                    # Custom React hooks
│   ├── providers/                # Context providers
│   ├── lib/                      # Utilities and helpers
│   ├── constants/                # Constants and static data
│   ├── package.json
│   └── next.config.ts
│
├── server/                         # Backend API (Express.js)
│   ├── controllers/              # Request handlers
│   ├── models/                   # Mongoose schemas
│   ├── routes/                   # API routes
│   ├── middlewares/              # Express middlewares
│   ├── config/                   # Database and service configs
│   ├── utils/                    # Helper utilities
│   ├── types/                    # TypeScript type definitions
│   ├── index.ts                  # Entry point
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your system:

- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**: v9.0.0 or higher
- **MongoDB**: Local instance or Atlas cluster connection string
- **Git**: For version control

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/ahmedmostafaa0/baby-shop.git
cd baby-shop
```

2. **Install dependencies for all packages**

```bash
# Install admin dashboard dependencies
cd admin
npm install
cd ..

# Install client portal dependencies
cd client
npm install
cd ..

# Install server dependencies
cd server
npm install
cd ..
```

### Environment Variables

Create `.env` files in the respective directories with the following variables:

#### Server (`.env` in `/server`)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/baby-shop
# OR for MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/baby-shop

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Email Service (Nodemailer)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
ADMIN_URL=http://localhost:5173
```

#### Client (`.env.local` in `/client`)

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

#### Admin (`.env` in `/admin`)

```env
VITE_SERVER_URL=http://localhost:5000
```

### Running the Project

#### Option 1: Run all services in separate terminals

**Terminal 1 - Backend Server**

```bash
cd server
npm run dev
```

Server runs on `http://localhost:5000`

**Terminal 2 - Client Portal**

```bash
cd client
npm run dev
```

Client runs on `http://localhost:3000`

**Terminal 3 - Admin Dashboard**

```bash
cd admin
npm run dev
```

Admin runs on `http://localhost:5173`

#### Option 2: Build for production

```bash
# Build admin dashboard
cd admin
npm run build

# Build client
cd client
npm run build

# Build server
cd server
npm run build
```

---

## 💻 Usage

### For Customers

1. **Browse Products**: Navigate to the shop and explore baby products
2. **Search & Filter**: Use search bar and filters to find specific items
3. **Add to Cart/Wishlist**: Click the heart or cart icon on products
4. **Checkout**: Add items to cart and proceed to secure checkout
5. **Make Payment**: Enter payment details through Stripe
6. **Track Orders**: View order history in your account

### For Administrators

1. **Login**: Access admin panel at `/admin` with admin credentials
2. **Dashboard**: View real-time analytics and statistics
3. **Manage Products**: Create, edit, or delete products
4. **Manage Categories/Brands**: Organize your product catalog
5. **Process Orders**: View and update order statuses
6. **Generate Invoices**: Export order invoices as PDF
7. **Manage Users**: View and manage customer accounts
8. **Upload Banners**: Manage promotional banners

---

## 📚 API Documentation

The project includes Swagger API documentation. Generate it using:

```bash
cd server
npm run swagger
```

API documentation will be available at `http://localhost:5000/api-docs`

### Main API Endpoints

#### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

#### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

#### Categories & Brands

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin)
- `GET /api/brands` - Get all brands
- `POST /api/brands` - Create brand (Admin)

#### Orders

- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status (Admin)

#### Cart

- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart

#### Users

- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user (Admin)

---

## 🏗️ Project Architecture

### Authentication Flow

```
Client Login Request
    ↓
Server validates credentials (bcrypt)
    ↓
Generates JWT token
    ↓
Returns token to client
    ↓
Client stores token (localStorage/cookies)
    ↓
Subsequent requests include token in headers
    ↓
Middleware validates token
```

### Payment Flow (Stripe)

```
User initiates checkout
    ↓
Client sends order data to server
    ↓
Server creates Stripe payment intent
    ↓
Returns client secret to client
    ↓
Client initializes Stripe Elements
    ↓
User completes payment
    ↓
Server verifies payment
    ↓
Order is confirmed in database
    ↓
Invoice is generated
```

### Image Upload Flow (Cloudinary)

```
Admin uploads image
    ↓
Multer processes file
    ↓
Sends to Cloudinary
    ↓
Returns secure URL
    ↓
URL stored in database
    ↓
Images cached and delivered via CDN
```

---

## 🤝 Contributing

Contributions are welcome! Here's how to contribute:

1. **Fork the repository**

```bash
git clone https://github.com/yourusername/baby-shop.git
```

2. **Create a feature branch**

```bash
git checkout -b feature/AmazingFeature
```

3. **Make your changes**

- Follow the existing code style
- Ensure TypeScript types are correct
- Add comments for complex logic

4. **Commit your changes**

```bash
git commit -m 'Add some AmazingFeature'
```

5. **Push to the branch**

```bash
git push origin feature/AmazingFeature
```

6. **Open a Pull Request**

- Provide a clear description of changes
- Reference any related issues

### Development Guidelines

- Use TypeScript for type safety
- Follow the established folder structure
- Use Zustand for state management
- Implement error handling properly
- Add proper validation (Zod schemas)
- Write meaningful commit messages

---

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 👤 Contact

**Ahmed Mostafa**

- GitHub: [@ahmedmostafaa0](https://github.com/ahmedmostafaa0)
- Project Repository: [baby-shop](https://github.com/ahmedmostafaa0/baby-shop)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Express.js](https://expressjs.com/) - Node.js framework
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [Stripe](https://stripe.com/) - Payment processing
- [Cloudinary](https://cloudinary.com/) - Image management
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Radix UI](https://www.radix-ui.com/) - Accessible component library

---

<div align="center">

**[⬆ back to top](#baby-shop---full-stack-e-commerce-platform)**

Made with ❤️ by Ahmed Mostafa

</div>
