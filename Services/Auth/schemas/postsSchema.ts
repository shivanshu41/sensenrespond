import mongoose, { Document, Schema } from 'mongoose';

export interface Media {
    url : string
}

export interface Post {
    title: string,
    description: Boolean
    page: String
    medias : Media[]
    createdBy : string
    reactions : any[] 
    isPinned : Boolean | false,
    is_deleted : Boolean
    active : Boolean
    questionId: string
}
export interface POSTDOC extends Post, Document {

}

const mediaSchema = new Schema({
    url : {
        type  :Schema.Types.String,
    }
})

interface MEDIADOC extends Media , Document{}
export const mediaModel = mongoose.model<MEDIADOC>('Media',mediaSchema);

const postsSchema = new Schema({
    title: {
        type : Schema.Types.String,
        required : false
    },
    description: {
        type : Schema.Types.String
    },
    // medias : [mediaSchema],
    createdBy : {
        type : Schema.Types.ObjectId,
        ref : "User",
    },
    reactions :{
        type : Schema.Types.Array
    },
    is_deleted: {
        type: Schema.Types.Boolean,
        default: false,
    },
    page: {
        type: Schema.Types.ObjectId,
        ref: "Page",
        required: true
    },
    isPinned : {
        type : Schema.Types.Boolean,
        default : false
    },
    commentsDisabled : {
        type : Schema.Types.Boolean,
        default : false
    },
    questionId: {
        type: Schema.Types.String,
        default : ""
    },
    active:{
        type : Schema.Types.Boolean,
        default : true
    },
}, { timestamps: true })

export default mongoose.model<POSTDOC>('Post', postsSchema);