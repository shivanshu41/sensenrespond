import mongoose, { Document, Schema } from 'mongoose';

const postModel = require('./commentsSchema');
export interface ReplyInterface {
    comment: string,
    createdBy: string,
    reply: string,
    message: string,
    media: string
}

export interface REPLYDOC extends ReplyInterface, Document {

}

export const replySchema = new Schema({
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    message: {
        type: Schema.Types.ObjectId,
        ref: "Message"
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    media: {
        type: Schema.Types.String,
    },
    image: {
        type: Schema.Types.String,
    },
    reply: {
        type: Schema.Types.String
    },
    is_deleted: {
        type: Schema.Types.Boolean,
        default: false
    }
}, { timestamps: true })



export default mongoose.model<REPLYDOC>('Reply', replySchema);