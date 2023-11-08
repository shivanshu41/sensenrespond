import mongoose, { Document, Schema } from 'mongoose';

const postModel = require('./postsSchema');
export interface CommentInterface {
    post: string,
    createdBy: string,
    comment: string,
    // replies: any[],
    media: string,
    is_deleted: boolean | false,
}
export interface COMMENTDOC extends CommentInterface, Document {

}

export const commentSchema = new Schema({
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post"
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    media: {
        type: Schema.Types.String,
    },
    comment: {
        type: Schema.Types.String,
    },
    image: {
        type: Schema.Types.String,
    },
    is_deleted: {
        type: Schema.Types.Boolean,
        default: false
    }
}, { timestamps: true })



export default mongoose.model<COMMENTDOC>('Comment', commentSchema);