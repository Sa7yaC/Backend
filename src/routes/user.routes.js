// routes/room.routes.js
import express from 'express';
import { loginUser, registerUser } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/registerUser', registerUser);
router.post('/loginUser', loginUser)

export default router;
