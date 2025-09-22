// routes/room.routes.js
import express from 'express';
import { registerUser } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/registerUser', registerUser);

export default router;
