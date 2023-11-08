import mongoose, { Document, Schema } from 'mongoose';

const postModel = require('./commentsSchema');
export interface ReplyInterface {
    comment: string,
    createdBy: string,
    reply: string,
}

export interface REPLYDOC extends ReplyInterface, Document {

}

export const replySchema = new Schema({
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
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