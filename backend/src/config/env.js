import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 8080),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  bootstrapAdmin: {
    email: process.env.BOOTSTRAP_ADMIN_EMAIL,
    password: process.env.BOOTSTRAP_ADMIN_PASSWORD,
    name: process.env.BOOTSTRAP_ADMIN_NAME,
  },
};

