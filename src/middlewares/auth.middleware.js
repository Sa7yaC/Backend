
import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

export function authenticateToken(req, res, next){
    let token;

    const authHeader = req.headers['authorization'];
    if(authHeader && authHeader.startsWith('Bearer ')){
        token = authHeader.split(' ')[1];
    }
    if(!token && req.cookies){
        token = req.cookies.accessToken;
    }

    if(!token){
        return res.status(401).json({
            message: 'Access token missing',
            success: false,
            data: null,
            statusCode: 401
        });
    }

    jwt.verify(token, JWT_SECRET, (err,user)=>{
        if(err){
            return res.status(403).json({
                message: 'Invalid access token',
                success: false,
                data: null,
                statusCode: 403
            });
        }
        req.user = user;
        next();
    })
}
export function authorizeRoles(...allowedRoles){
        return (req, res, next)=>{
            // if req.user exists and has a role
            if(!req.user || !req.user.role){
                return res.status(403).json({
                    message: 'Unauthorized - user not found or token invalid',
                    success: false,
                    data: null,
                    statusCode: 403
                })
            }
            // if req.user is allowed for the role
            if(!allowedRoles.includes(req.user.role)){
                return res.status(403).json({
                    message: 'forbidden - user not allowed to access',
                    success: false,
                    data: null,
                    statusCode: 403
                })
            }
            next();
        };
    }

    export function generateAccessToken(payload){
        return jwt.sign(payload, JWT_SECRET, {expiresIn: '15min'});
    }
    export function generateRefreshToken(payload){
        return jwt.sign(payload, REFRESH_SECRET, {expiresIn: '7d'});
    }
    export function verifyRefreshToken(token){
        return jwt.verify(token, REFRESH_SECRET);
    }