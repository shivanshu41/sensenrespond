//@ts-nocheck
import { NextFunction, Router } from 'express'
import { OPERATION } from './operations';
import { PageController } from '../controllers/index';
import { authenticateToken } from '../../middlewares/authenticate';

let router = Router()

router.all('/', (req, res) => {
   res.send("Welcome to Sense and Respond LLC " + process.env.SERVICE_NAME)
})

router.post('/:operation', async (req: Express.Request, res: Express.Response, next: NextFunction) => {

   let param = req.params.operation.toUpperCase() as string;
   let operation = new OPERATION(param, req, res);
   operation.set()
   let results = await operation.execute(req.body);
   res.result = results
   next()
})

router.get('/list/:ownerId', authenticateToken, async (req: Express.Request, res: Express.Response, next: NextFunction) => {
   let allPages = await new PageController().getPages(req.params.ownerId);
   res.result = allPages
   next()
})

router.get('/:pageId/post/list', async (req: Express.Request, res: Express.Response, next: NextFunction) => {
   let page = parseInt(req.query.page);
   let allPages = await new PageController().getPostFeed(req.params.pageId, page, 15);
   res.result = allPages
   next()
})



router.put('/post/:postId', authenticateToken, async (req: Express.Request, res: Express.Response, next: NextFunction) => {
   let allPages = await new PageController().editPost(req.params.postId, req.body);
   res.result = allPages
   next()
})

router.delete('/post/:postId', authenticateToken, async (req: Express.Request, res: Express.Response, next: NextFunction) => {
   let allPages = await new PageController().deletePost(req.params.postId, req.body);
   res.result = allPages
   next()
})



router.post('/post/comment', authenticateToken, async (req: Express.Request, res: Express.Response, next: NextFunction) => {
   let allEvents = await new PageController().addComments(req.body);
   res.result = allEvents;
   next()

})

router.get('/post/:postId/comment', authenticateToken, async (req: Express.Request, res: Express.Response, next: NextFunction) => {
   let pageNumber = req.query.page;
   let pageLength = req.query.length
   let allEvents = await new PageController().getComments(req.params.postId,pageNumber,pageLength);
   res.result = allEvents;
   next()
})


router.put('/post/comment/:commentId', authenticateToken, async (req: Express.Request, res: Express.Response, next: NextFunction) => {
   let page = await new PageController().editComment(req.body, req.params.commentId);
   res.result = page;
   next()
})

router.delete('/post/comment/:commentId', authenticateToken, async (req: Express.Request, res: Express.Response, next: NextFunction) => {
   let page = await new PageController().deleteComment(req.params.commentId);
   res.result = page;
   next()
})

router.post('/post/comment/reply', authenticateToken, async (req: Express.Request, res: Express.Response, next: NextFunction) => {
   let page = await new PageController().addReply(req.body);
   res.result = page;
   next()
})

router.put('/post/comment/reply/:replyId', authenticateToken, async (req: Express.Request, res: Express.Response, next: NextFunction) => {
   let page = await new PageController().editReply(req.params.replyId, req.body);
   res.result = page;
   next()
})

router.delete('/post/comment/reply/:replyId', authenticateToken, async (req: Express.Request, res: Express.Response, next: NextFunction) => {
   let page = await new PageController().deleteReply(req.params.replyId);
   res.result = page;
   next()
})

router.post('/post/like', authenticateToken, async (req: Express.Request, res: Express.Response, next: NextFunction) => {
   let allEvents = await new PageController().addLike(req.body);
   res.result = allEvents;
   next()
})

router.post('/post/comment/react', authenticateToken, async (req: Express.Request, res: Express.Response, next: NextFunction) => {
   let allEvents = await new PageController().addReaction(req.body);
   res.result = allEvents;
   next()
})

router.post('/post/comment/reply/react', authenticateToken, async (req: Express.Request, res: Express.Response, next: NextFunction) => {
   let allEvents = await new PageController().addReaction(req.body);
   res.result = allEvents;
   next()
})

router.delete('/post/comment/react/:reactId', authenticateToken, async (req: Express.Request, res: Express.Response, next: NextFunction) => {
   let allEvents = await new PageController().removeReaction(req.params.reactId);
   res.result = allEvents;
   next()
})

router.put('/post/comment/react/:reactId', authenticateToken, async (req: Express.Request, res: Express.Response, next: NextFunction) => {
   let allEvents = await new PageController().editReaction(req.params.reactId, req.body);
   res.result = allEvents;
   next()
})

router.delete('/post/comment/reply/react/:reactId', authenticateToken, async (req: Express.Request, res: Express.Response, next: NextFunction) => {
   let allEvents = await new PageController().removeReaction(req.params.reactId);
   res.result = allEvents;
   next()
})



router.get('/post/:postId/like', authenticateToken, async (req: Express.Request, res: Express.Response, next: NextFunction) => {
   let allEvents = await new PageController().getAllLikes(req.params.postId);
   res.result = allEvents;
   next()
})


router.delete('/post/:postId/like/:likeId', authenticateToken, async (req: Express.Request, res: Express.Response, next: NextFunction) => {
   let allEvents = await new PageController().removeLike(req.params.likeId, req.params.postId);
   res.result = allEvents;
   next()
})



router.delete('/delete/:pageId/:userId', authenticateToken, async (req: Express.Request, res: Express.Response, next: NextFunction) => {
   let page = await new PageController().deletePage(req.params.pageId, req.params.userId, req.body);
   res.result = page;
   next()
})


router.get('/details/post/:postId', authenticateToken, async (req: Express.Request, res: Express.Response, next: NextFunction) => {
   let result = await new PageController().getPostDetails(req.params.postId);
   res.result = result;
      next()
})




export default router
