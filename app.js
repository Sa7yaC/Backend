import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express()
app.use(cookieParser());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({limit: '20kb'}))
app.use(express.urlencoded({ extended: true, limit: '20kb' }))
app.use(express.static("public"))

// //import routes
import userRoutes from './src/routes/user.routes.js';
// import adminRoutes from '../src/routes/admin.routes.js';

app.use("/api/v1/user", userRoutes);
// app.use("/api/v1/admin", adminRoutes);
export { app };