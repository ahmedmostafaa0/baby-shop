import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import Login from './pages/Login';
import Register from "./pages/Register.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Account from "./pages/Account.tsx";
import Users from "./pages/Users.tsx";
import Orders from "./pages/Orders.tsx";
import Invoices from "./pages/Invoices.tsx";
import Banners from "./pages/Banners.tsx";
import Categories from "./pages/Categories.tsx";
import Brands from "./pages/Brands.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import Products from "./pages/Products.tsx";
import NotFound from "./components/NotFound.tsx";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />
      },
      {
        path: '/dashboard/account',
        element: <Account />
      },
      {
        path: '/dashboard/users',
        element: <Users />
      },
      {
        path: '/dashboard/orders',
        element: <Orders />
      },
      {
        path: '/dashboard/invoices',
        element: <Invoices />
      },
      {
        path: '/dashboard/banners',
        element: <Banners />
      },
      {
        path: '/dashboard/categories',
        element: <Categories />
      },
      {
        path: '/dashboard/brands',
        element: <Brands />
      },
      {
        path: '/dashboard/products',
        element: <Products />
      },
    ]
  },
  {
    path: '*',
    element: <NotFound />
  }
]);

createRoot(document.getElementById("root")!).render(
  <>
    <RouterProvider router={router} />
    <Toaster richColors position="top-center" />
  </>
);
