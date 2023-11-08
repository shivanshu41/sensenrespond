import mongoose, { Document, Schema } from 'mongoose';



//Requiring the model tells mongoose that schema has been loaded. Otherwise you will get MissingSchemaError: Schema hasn't been registered for model "User".
const UserModel = require("./userSchema");
export interface PageInterface {
    first_name: string,
    last_name: string,
    unique_url: string,
    is_published: Boolean, // 0 - No, 1 - Yes
    image: String,
    image_cropped: String,
    privacy_status: PrivacyStatus.hidden | PrivacyStatus.private | PrivacyStatus.public,  // 0 - public, 1 - private, 2 - hidden
    is_deleted: Boolean
    belongsTo: String,
    userId: string,
    page: number,
    searchKey: string,
    
}
export interface PAGEDOC extends PageInterface, Document {

}

export enum PrivacyStatus {
    public = "PUBLIC",
    private = "PRIVATE",
    hidden = "HIDDEN"
}






const page = new Schema({
    belongsTo: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    first_name: {
        type: Schema.Types.String,
        required: true
    },
    last_name: {
        type: Schema.Types.String,
        required: false
    },
    unique_url: {
        type: Schema.Types.String,
        required: true
    },
    is_published: {
        type: Schema.Types.Boolean,
        required: true,
        default: false
    }, // 0 - No, 1 - Yes
    image: {
        type: Schema.Types.String,
        required: false,
    },
    image_cropped: {
        type: Schema.Types.String,
        required: false,
        default: ""
    },
    privacy_status: {
        type: Schema.Types.String,
        enum: [PrivacyStatus.hidden, PrivacyStatus.private, PrivacyStatus.public],
        default: PrivacyStatus.public
    },  // 0 - public, 1 - private, 2 - hidden
    is_deleted: {
        type: Schema.Types.Boolean,
        default: false
    }

}, { timestamps: true })

export default mongoose.model<PAGEDOC>('Page', page);