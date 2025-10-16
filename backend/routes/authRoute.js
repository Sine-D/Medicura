import express from 'express';
import { loginUser, registerUser, verifyToken } from '../controllers/authController.js';

const authRouter = express.Router();

// Login route for all user types
authRouter.post('/login', loginUser);

// Register route for all user types
authRouter.post('/register', registerUser);

// Verify token route
authRouter.get('/verify', verifyToken, (req, res) => {
    res.json({ 
        success: true, 
        user: req.user 
    });
});

export default authRouter;
