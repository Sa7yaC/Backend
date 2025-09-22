import bcrypt from 'bcrypt';
import User from '../db/models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import hashPassword from '../utils/hashing.auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';


export const registerUser = asyncHandler(async(req,res)=>{
    const {userName,password,email,mobileNumber} = req.body;
    const exisitingUser = await User.findOne({$or: [{userName},{email}]});
    if(exisitingUser) return res.status(400).send("User already exists");
    const hashed = await hashPassword(password);

    const newUser = await User.create({
        userName,
        password: hashed,
        email,
        mobileNumber,
        role: 'user'
    })

    const createdUser = await User.findById(newUser._id).select('-password -__v -refreshToken');
    if(!createdUser) throw new ApiError(500,"Unable to create user");

    return res.status(201).json(new ApiResponse(200,createdUser,"User created successfully"));
})