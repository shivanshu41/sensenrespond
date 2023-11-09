//@ts-nocheck
import { HttpCode } from '../../../utility/http.code.utils';
import { Codemessages } from '../../../utility/code.message.utils';
import { v5, v4 } from 'uuid';
const v4Ns = v4();
require('dotenv').config();
import PageModel, { PageInterface } from '../../models/pageSchema';
import PostModel, { Post } from '../../models/postsSchema';
import UserModel from '../../models/userSchema';
import pageSchema from '../../models/pageSchema';
import userSchema from '../../models/userSchema';
import postsSchema from '../../models/postsSchema';
import CommentModel, { CommentInterface } from '../../models/commentsSchema';
import likeModel, { LikeInterface } from '../../models/likesSchema';
import replySchema from '../../models/replySchema';
import reactionSchema, { ReactionInterface } from '../../models/reactionSchema';
import { ReplyInterface } from '../../models/replySchema';

export class PageDao {
    private readonly _jwtSecret = '0.rfyj3n9nzh'
    private readonly _controllerId: string
    public _emailTemplate: any
    constructor() {
        this._controllerId = v5(this._jwtSecret, v4Ns)
    }


    public async getPages(ownerId) {
        try {
            let allPages = await PageModel.find({ belongsTo: ownerId, is_deleted: false }).populate("belongsTo", "name image").sort({ createdAt: -1 });
            return { success: true, status: HttpCode.HTTP_OK, message: 'Success', data: allPages };
        } catch (e) {
            return { success: false, status: HttpCode.HTTP_INTERNAL_SERVER_ERROR, message: 'Internal server error' };
        }
    }

    public async createPage(pagePayload: PageInterface) {
        console.log("CREATE PAGE ");
        try {
            let existingPage = await PageModel.findOne({ unique_url: pagePayload.unique_url });
            if (existingPage) {
                return { success: false, status: HttpCode.HTTP_BAD_REQUEST, message: 'Page already exists' };
            } else {
                let newPage = await new PageModel({ ...pagePayload, first_name: pagePayload.first_name.trim(), last_name: pagePayload.last_name.trim() }).save();
                console.log("NEWPAGE CREATED ", newPage.unique_url);
                if (newPage) return { success: true, status: HttpCode.HTTP_CREATED, message: 'Page created successfully', data: { ...newPage.toObject() } };
            }
        } catch (error) {
            return { success: false, status: HttpCode.HTTP_INTERNAL_SERVER_ERROR, message: 'Internal server error' };

        }
    }


    public async createPost(postPayload: Post) {
        try {
            let pageData = await pageSchema.findById(postPayload.page.toString());
            let pagePop = await pageData.populate("belongsTo", "name _id");
            let OwnerInfo = await UserModel.findById(pageData.belongsTo);
            let userInfo = await UserModel.findById(postPayload.createdBy);
            if (!pageData) return { success: false, status: HttpCode.HTTP_NOT_FOUND, message: "Page doesn't exist" }
            console.log("PAGE DATA ", pageData);
            let newPost = await new PostModel({ ...postPayload, active: true }).save();
            if (newPost) return {
                success: true, status: HttpCode.HTTP_OK, message: "Page Feed created successfully", data: {
                    ...newPost.toObject(), count: {
                        comments: 0,
                        likes: 0
                    }, likes: [],
                }
            };
            else throw { success: false, status: HttpCode.HTTP_BAD_REQUEST, message: 'Bad Request' }

        } catch (error) {
            console.log("NEW POST ", error);

            return { success: false, status: HttpCode.HTTP_BAD_REQUEST, message: 'Invalid Request' };

        }
    }


    public async editPost(postId: string, postPayload: Post) {
        try {
            let editResults = await postsSchema.findByIdAndUpdate(postId, postPayload, { new: true })
            if (editResults) return { success: true, status: HttpCode.HTTP_ACCEPTED, message: 'Accepted', data: editResults }
            else return { success: false, status: HttpCode.HTTP_BAD_REQUEST, message: 'Invalid Request' };
        } catch (error) {
            return { success: false, status: HttpCode.HTTP_BAD_REQUEST, message: 'Invalid Request' };

        }
    }



    public async deletePost(postId: string) {
        try {
            let deleteResults = await postsSchema.findByIdAndUpdate(postId, { is_deleted: true }, { new: true })
            if (deleteResults) return { success: true, status: HttpCode.HTTP_ACCEPTED, message: 'Accepted' }
            else return { success: false, status: HttpCode.HTTP_BAD_REQUEST, message: 'Invalid Request' };
        } catch (error) {

            return { success: false, status: HttpCode.HTTP_BAD_REQUEST, message: 'Invalid Request' };

        }
    }


    public async addComments(commentPayload: CommentInterface) {
        try {
            if (!commentPayload.createdBy) {
                return { success: false, status: HttpCode.HTTP_BAD_REQUEST, message: 'Bad request' };
            }
            let newComment = await new CommentModel(commentPayload).save();

            if (newComment) return { success: true, status: HttpCode.HTTP_CREATED, message: 'Success', data: newComment };
        } catch (error) {
            console.log(error);
            return { success: false, status: HttpCode.HTTP_INTERNAL_SERVER_ERROR, message: 'Internal Server Error' };
        }
    }

    public async addLike(likePayload: LikeInterface) {
        try {
            // chk if like exists
            console.log("likePayload ", likePayload)
            if (!likePayload.createdBy) {
                return { success: false, status: HttpCode.HTTP_BAD_REQUEST, message: 'Bad request' };
            }
            let newLike = await new likeModel(likePayload).save();
            if (newLike) return { success: true, status: HttpCode.HTTP_CREATED, message: 'Success', data: newLike };
        } catch (error) {
            return { success: false, status: HttpCode.HTTP_INTERNAL_SERVER_ERROR, message: 'Internal Server Error' };
        }
    }


    public async removeLike(likeId: string, postId: string) {
        try {
            let removeLikeResult = await likeModel.findByIdAndRemove(likeId, { post: postId });
            if (removeLikeResult) return { success: true, status: HttpCode.HTTP_OK, message: 'Success' };
        } catch (error) {
            return { success: false, status: HttpCode.HTTP_INTERNAL_SERVER_ERROR, message: 'Internal Server Error' };
        }
    }


    public async getAllLikes(postId: string) {
        try {
            let allLikes = await likeModel.find({ post: postId, is_deleted: false });
            if (allLikes) return { success: true, status: HttpCode.HTTP_OK, message: 'Success', data: allLikes };
        } catch (error) {
            return { success: false, status: HttpCode.HTTP_INTERNAL_SERVER_ERROR, message: 'Internal Server Error' };
        }
    }


    public async getComments(postId: string ,pageNumber : number , pageLength : number) {
        try {
            let allComments = await CommentModel.find({ post: postId, is_deleted: false }).sort({ createdAt: "ascending" })
            .skip(pageNumber > 0 ? ((pageNumber - 1) * pageLength) : 0).limit(pageLength)
            .populate("createdBy", "name image");
            let allRepliesPromises = allComments.map((c) => {
                return new Promise(async (resolve) => {
                    let replies = await replySchema.find({ comment: c._id }).sort({ createdAt: "ascending" }).populate("createdBy", "name image");
                    let allRepliesReact = replies.map((r) => {
                        return reactionSchema.find({ reply: r._id }).populate("createdBy", "name image");
                    })
                    let allRepliesReactPromises = await Promise.all(allRepliesReact);
                    //  now merge replies with reactions;
                    let mergedReplies = replies.map((r, i) => {
                        return { ...r.toObject(), reactions: allRepliesReactPromises[i] }
                    })
                    resolve(mergedReplies);
                })
            })

            let allReplies = await Promise.all(allRepliesPromises);

            // merge replies in comments;
            let allReactionsPromises = allComments.map((c) => {
                return reactionSchema.find({ comment: c._id }).populate("createdBy", "name image");
            })

            let allReactions = await Promise.all(allReactionsPromises);

            let finalMerge = allComments.map((c, i) => {
                return { ...c.toObject(), replies: allReplies[i], reactions: allReactions[i] }
            })

            return { success: true, status: HttpCode.HTTP_OK, message: 'Success', data: finalMerge };
        } catch (error) {
            return { success: false, status: HttpCode.HTTP_INTERNAL_SERVER_ERROR, message: 'Internal Server Error' };
        }
    }


    public async GetPostFeed(pageId: string, pageNumber: any, pageLength: any) {
        try {
           
            let allPosts = await PostModel.find({ page: pageId, is_deleted: false, active: true, isPinned: false })
                .skip(pageNumber > 0 ? ((pageNumber - 1) * pageLength) : 0).limit(pageLength)
                .populate("createdBy", "name image").sort({ createdAt: "descending" });
            let totalCount = await PostModel.count({ page: pageId, is_deleted: false, active: true });
            
            let finalMerge = allPosts;
          

            let allCommentsCounts = finalMerge.map((f) => {
                return CommentModel.count({ post: f._id });
            })
            let allCommentCountPromises = await Promise.all(allCommentsCounts);

            let allLikesCount = finalMerge.map((f) => {
                return likeModel.count({ post: f._id })
            })


            let allLikesCountPromises = await Promise.all(allLikesCount);

            let allLikes = finalMerge.map(async (l) => {
                return likeModel.find({ post: l._id }).populate("createdBy", "name image")
            })

            let allLikesPromises = await Promise.all(allLikes);

            // assignning comment and likes count both and also likes

            let heavyMerge = finalMerge.map((f, i) => {
                return { ...f.toObject(), counts: { comments: allCommentCountPromises[i], likes: allLikesCountPromises[i] }, likes: allLikesPromises[i] }
            })

            return { success: true, status: HttpCode.HTTP_OK, message: 'Success', data: heavyMerge, totalRecords: totalCount, page: pageNumber };

        } catch (error) {
            return { success: false, status: HttpCode.HTTP_BAD_REQUEST, message: 'Invalid Request' };

        }

    }

    public async getPostDetails(postId: string) {
        try {
            let allPosts = await PostModel.find({ _id: postId, is_deleted: false, active: true }).populate("createdBy", "name image");

            


            // now merge medias to post results
            let finalMerge = allPosts;
            

            // provide like count and comment count for all posts

            let allCommentsCounts = finalMerge.map((f) => {
                return CommentModel.count({ post: f._id });
            })
            let allCommentCountPromises = await Promise.all(allCommentsCounts);

            let allLikesCount = finalMerge.map((f) => {
                return likeModel.count({ post: f._id })
            })


            let allLikesCountPromises = await Promise.all(allLikesCount);

            let allLikes = finalMerge.map(async (l) => {
                return likeModel.find({ post: l._id }).populate("createdBy", "name image")
            })

            let allLikesPromises = await Promise.all(allLikes);

            // assignning comment and likes count both and also likes

            let heavyMerge = finalMerge.map((f, i) => {
                return { ...f.toObject(), counts: { comments: allCommentCountPromises[i], likes: allLikesCountPromises[i] }, likes: allLikesPromises[i] }
            })

            return { success: true, status: HttpCode.HTTP_OK, message: 'Success', data: heavyMerge };

        } catch (e) {
            console.log(e);
            return { success: false, status: HttpCode.HTTP_INTERNAL_SERVER_ERROR, message: e.message || 'Internal server error' };
        }
    }

    public async deletePage(pageId: string, userId: string) {
        try {
            let page = await pageSchema.findById(pageId);
            const filter = { _id: pageId, belongsTo: userId };
            // const deleteResults = await pageSchema.findOneAndUpdate(filter, update, { new: true });
            const deleteResults = await pageSchema.findOneAndRemove(filter);

            console.log("Page data", page);
            let members = page.members as Array;
            console.log("mem", members);
            let owner = await userSchema.findById(userId);
            if (deleteResults) {
                // for (let i = 0; i < members.length; i++) {
                //     let user = await userSchema.findById(members[i].user);
                //     memberEmails.push(user?.email);                    
                // }
                for (let i = 0; i < members.length; i++) {
                    let user = await userSchema.findById(members[i].user);
                    var data: any = {
                        type: 'Delete_Page',
                        email: user?.email,
                        ownerName: owner?.name,
                        pageName: page?.first_name,
                        memberName: user?.name
                    }
                    var deleteMsg: any = await this.EmailSend(data);
                    console.log("Delete EMAIL SEND ", deleteMsg);
                }

                return { success: true, status: HttpCode.HTTP_OK, message: Codemessages.page_delete }
            } else {
                return { success: false, status: HttpCode.HTTP_BAD_REQUEST, message: 'Invalid Request' };
            }
        } catch (error) {
            console.log(error);
            return { success: false, status: HttpCode.HTTP_BAD_REQUEST, message: 'Invalid Request' };

        }
    }
    public async deleteComment(commentId: string) {
        try {
            let deleteCommentResult = await CommentModel.findByIdAndRemove(commentId);

            if (deleteCommentResult) return { success: true, status: HttpCode.HTTP_OK, message: 'Success' };
        } catch (error) {
            return { success: false, status: HttpCode.HTTP_INTERNAL_SERVER_ERROR, message: 'Internal Server Error' };
        }
    }

    public async editComment(commentPayload: CommentInterface, commentId: string) {
        try {
            let editedComment = await CommentModel.findByIdAndUpdate(commentId, commentPayload, { new: true });
            if (editedComment) return { success: true, status: HttpCode.HTTP_ACCEPTED, message: 'Success', data: editedComment }
            else throw null
        } catch (error) {
            return { success: false, status: HttpCode.HTTP_INTERNAL_SERVER_ERROR, message: 'Internal Server Error' };
        }
    }

    public async addReply(replyPayload: ReplyInterface) {
        try {
            let newReply = await new replySchema(replyPayload).save();
            let replyPopCreatedBy = await newReply.populate("createdBy", "name image _id")
            if (newReply) return { success: true, status: HttpCode.HTTP_CREATED, message: 'Success', data: replyPopCreatedBy };
        } catch (error) {
            console.log("error ", error);
            return { success: false, status: HttpCode.HTTP_INTERNAL_SERVER_ERROR, message: 'Internal Server Error' };
        }
    }


    public async editReply(replyId: string, replyPayload: ReplyInterface) {
        try {
            let editedReply = await replySchema.findByIdAndUpdate(replyId, replyPayload, { new: true });
            if (editedReply) return { success: true, status: HttpCode.HTTP_ACCEPTED, message: 'Success', data: editedReply }
            else throw null
        } catch (error) {
            return { success: false, status: HttpCode.HTTP_INTERNAL_SERVER_ERROR, message: 'Internal Server Error' };
        }
    }

    public async deleteReply(replyId: string) {
        try {
            let deleteReplyResult = await replySchema.findByIdAndRemove(replyId);
            if (deleteReplyResult) return { success: true, status: HttpCode.HTTP_OK, message: 'Success' };
        } catch (error) {
            return { success: false, status: HttpCode.HTTP_INTERNAL_SERVER_ERROR, message: 'Internal Server Error' };
        }
    }


    public async addReaction(reactionPayload: ReactionInterface) {
        try {
            // chk if like exists
            let newReaction = await new reactionSchema(reactionPayload).save();
            let pop = await newReaction.populate("createdBy", "name image _id");
            if (pop) return { success: true, status: HttpCode.HTTP_CREATED, message: 'Success', data: pop };
        } catch (error) {
            return { success: false, status: HttpCode.HTTP_INTERNAL_SERVER_ERROR, message: 'Internal Server Error' };
        }
    }

    public async removeReaction(reactionId: string) {
        try {
            let removeLikeResult = await reactionSchema.findByIdAndRemove(reactionId);
            if (removeLikeResult) return { success: true, status: HttpCode.HTTP_OK, message: 'Success' };
        } catch (error) {
            return { success: false, status: HttpCode.HTTP_INTERNAL_SERVER_ERROR, message: 'Internal Server Error' };
        }
    }


    public async editReaction(reactionId: string, reactionPayload: ReactionInterface) {
        try {
            let reactionExists = await reactionSchema.findById(reactionId);
            if (!reactionExists) return { success: false, status: HttpCode.HTTP_NOT_FOUND, message: "Reaction  doesn't exist" };
            let reactionEdit = await reactionSchema.findByIdAndUpdate(reactionId, reactionPayload, { new: true });
            if (reactionEdit) return { success: true, status: HttpCode.HTTP_ACCEPTED, message: "Accepted", data: reactionEdit };
        } catch (error) {
            return { success: false, status: HttpCode.HTTP_INTERNAL_SERVER_ERROR, message: 'Internal server error' };
        }
    }


}
