import { PrivacyStatus } from "../models/pageSchema"

export interface Page {
    first_name: string,
    last_name: string,
    reason: string,
    unique_url: string,
    approval_required: Boolean, // 0 - No , 1 - Yes
    show_support_flag: String, // 0 - No, 1 - Yes
    is_published: Boolean, // 0 - No, 1 - Yes
    image: String,
    image_cropped: String,
    privacy_status: PrivacyStatus.hidden | PrivacyStatus.private | PrivacyStatus.public,  // 0 - public, 1 - private, 2 - hidden
    is_deleted: Boolean
    belongsTo: String,
    questions: any,
    userId: string,
    page: number,
    searchKey: string
    members : any[],
    from_legacy: Boolean,
    legacy_url: string
}