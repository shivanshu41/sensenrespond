import mongoose, { Document, Schema } from 'mongoose';

const postModel = require('./postsSchema');
export interface Replies {

}
export interface LikeInterface {
    post: string,
    createdBy: string,
    name: string,
    // replies: any[],
    is_deleted: boolean | false,
}
export interface LIKEDOC extends LikeInterface, Document {

}

export const likeSchema = new Schema({
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post"
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    name: {
        type: Schema.Types.String,
    },
    media: {
        type: Schema.Types.ObjectId,
        ref: "Gallery"
    },
    // replies: any[],
    is_deleted: {
        type: Schema.Types.Boolean,
        default: false
    }
}, { timestamps: true })


export default mongoose.model<LIKEDOC>('Like', likeSchema);