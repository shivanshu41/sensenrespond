import mongoose, { Document, Schema } from 'mongoose';
export interface User {
    name: String,
    is_admin: Boolean,
    email: String,
    image: String,
    password: string,
    is_blocked: Boolean,
    active_jwt: String,
    is_deleted: Boolean,
    isEmail_verified: Boolean,
    otp: String,
    provider: String,
    is_initiated: String,
    temp_password: String
    
}
export interface USERDOC extends User, Document {

}
const user = new Schema({
    name: String,
    is_admin: {
        type: Schema.Types.Boolean,
        default: false
    },  // 0 -Amdin, 1 - User
    email: String,
    image: {
        type: Schema.Types.String,
        default: ""
    },
    password: String,
    is_blocked: {
        type: Schema.Types.Boolean,
        default: false
    }, //0 - Unblock , 1-Block
    active_jwt: String,
    is_deleted: {
        type: Schema.Types.Boolean,
        default: false
    },
    isEmail_verified: {
        type: Schema.Types.Boolean,
        default: false
    },
    otp: String,
    provider: String, // Google, Socialite
    is_initiated: {
        type: Schema.Types.Boolean,
        default: false
    },
    temp_password: {
        type: Schema.Types.String,
        default: ''
    }

}, { timestamps: true })

export default mongoose.model<USERDOC>('User', user);