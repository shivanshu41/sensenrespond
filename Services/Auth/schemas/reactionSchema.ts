import mongoose, { Document, Schema } from 'mongoose';

const postModel = require('./postsSchema');
const CommentModel = require('./commentsSchema');
const repmodel = require('./replySchema');
export interface Replies {

}
export interface ReactionInterface {
    comment: string,
    reply: string,
    createdBy: string,
    name: string,
    message: string,
    messageReply : string,
    // replies: any[],
    is_deleted: boolean | false,
}
export interface REACTIONSDOC extends ReactionInterface, Document {

}

export const reactionSchema = new Schema({
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    reply: {
        type: Schema.Types.ObjectId,
        ref: "Reply"
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    name: {
        type: Schema.Types.String,
    },
    message: {
        type: Schema.Types.ObjectId,
        ref: "Message"
    },
    messageReply: {
        type: Schema.Types.ObjectId,
        ref: "Reply"
    },
    is_deleted: {
        type: Schema.Types.Boolean,
        default: false
    }
}, { timestamps: true })



export default mongoose.model<REACTIONSDOC>('Reactions', reactionSchema);