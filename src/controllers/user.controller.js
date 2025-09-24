import bcrypt from 'bcrypt';
import User from '../db/models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import hashPassword from '../utils/hashing.auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { generateAccessToken, generateRefreshToken } from '../middlewares/auth.middleware.js';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found for token generation");

        const accessToken = generateAccessToken({ _id: user._id, role: user.role });
        const refreshToken = generateRefreshToken({ _id: user._id, role: user.role });

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong while generating refresh and access token");
    }
};

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
});

export const loginUser = asyncHandler(async (req, res) => {
    const { userName, password } = req.body;

    const user = await User.findOne({ userName });
    if (!user) throw new ApiError(400, "User Not Found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ApiError(401, "Password Incorrect");

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        path: "/"
    };

    res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged In Successfully"
            )
        );
});

