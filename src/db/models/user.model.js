import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userName: {type: String, require: true, unique: true},
    password: {type:String,require: true},
    email: {type: String,require: true,unique: true},
    mobileNumber: {type: String,require: true},
    role:{
        type: String,
        default: 'user'
    },
    refreshToken:{
        type: String,
    }
});

const User = mongoose.model('User', userSchema);

export default User;
