import { v4 } from "uuid";
import { Context } from "../../apiGateway";
import { PageDao } from "../daos/page";
import { CommentInterface } from "../models/commentsSchema";
import { LikeInterface } from "../models/likesSchema";
import { PageInterface } from "../models/pageSchema";
import { Post } from "../models/postsSchema";
import { ReplyInterface } from "../models/replySchema";


export class PageController {
    inFlightToken: string | null
    controllerId: string
    // Controller Id should be in a parent class Gateway and parent class should handle all the inflight operation 
    // in-flight tokens can be temporarily stored in closure of the parent class.
    constructor() {
        this.inFlightToken = null;
        this.controllerId = v4();
    }

    public async getPages(ownerId: string, context: Context) {
        try {
            let results = await new PageDao().getPages(ownerId);
            return results
        } catch (e) {
            return e
        }
    }

    public async createPage(page: PageInterface, context: Context) {
        try {
            let results = await new PageDao().createPage(page);
            return results
        } catch (e) {
            return e
        }
    }


    public async createPost(post: Post, context: Context) {
        let results = await new PageDao().createPost(post);
        return results
    }

    public async getPostFeed(pageId: string, pageNumber: any, pageLength: any) {
        let results = await new PageDao().GetPostFeed(pageId, pageNumber, pageLength);
        return results
    }
    public async editPost(postId: string, postPayload: Post) {
        let results = await new PageDao().editPost(postId, postPayload);
        return results
    }

    public async deletePost(postId: string) {
        let results = await new PageDao().deletePost(postId);
        return results
    }

    public async addComments(commentPayload: CommentInterface) {
        let results = await new PageDao().addComments(commentPayload);
        return results
    }

    public async getComments(postId: string, pageNumber:number , pageLength:number) {
        let results = await new PageDao().getComments(postId,pageNumber,pageLength);
        return results
    }

    public async addLike(likePayload: LikeInterface) {
        let results = await new PageDao().addLike(likePayload);
        return results
    }

    public async getAllLikes(postId: string) {
        let results = await new PageDao().getAllLikes(postId);
        return results
    }

    public async removeLike(likeId: string, postId: string) {
        let results = await new PageDao().removeLike(likeId, postId);
        return results
    }

    public async deletePage(pageId: string, userId: string, context: Context) {
        let results = await new PageDao().deletePage(pageId, userId);
        return results
    }

    public async editComment(commentPayload: CommentInterface, commentId: string) {
        let results = await new PageDao().editComment(commentPayload, commentId);
        return results
    }

    public async addReply(replyPayload: ReplyInterface) {
        let results = await new PageDao().addReply(replyPayload);
        return results
    }

    public async deleteComment(commentId: string) {
        let results = await new PageDao().deleteComment(commentId);
        return results
    }

    public async editReply(replyId: string, replyPayload: ReplyInterface) {
        let results = await new PageDao().editReply(replyId, replyPayload);
        return results
    }

    public async deleteReply(replyId: string) {
        let results = await new PageDao().deleteReply(replyId);
        return results
    }
}
