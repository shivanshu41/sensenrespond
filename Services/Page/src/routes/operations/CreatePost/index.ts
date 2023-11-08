import { Context } from "../../../../apiGateway";
import { Post } from "../../../models/postsSchema";

import { PageController } from "../../../controllers/index";

export const CreatePost = async (payload: Post,context : Context) => {
    let control = new PageController();    
    let results = await control.createPost(payload, context);
    return results
}


export default CreatePost