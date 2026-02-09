import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import errorHandler from "./middlewares/error";
import connectDB from "./config/db";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./utils/swagger-output.json";

// import routes
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import productRoutes from "./routes/product";
import brandRoutes from "./routes/brand";
import categoryRoutes from "./routes/category";
import statsRoutes from "./routes/stats";
import orderRoutes from "./routes/order";
import cartRoutes from "./routes/cart";
import analyticsRoutes from "./routes/analytics";
import bannerRoutes from "./routes/banner";
import uploadRoutes from "./routes/upload";

dotenv.config();
connectDB();

const app = express();

app.get('/', (req, res) => {
  res.send('server is running')
})

const allowedOrigins = [
  process.env.ADMIN_URL,
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (process.env.NODE_ENV === "development") return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ['x-access-token']
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));


// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/upload", uploadRoutes);

// API Doc Route
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(errorHandler);

// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => {
//   console.log("BabyShop API Server is running!");
// });

export default app;
