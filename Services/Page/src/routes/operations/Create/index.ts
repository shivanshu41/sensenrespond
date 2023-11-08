import { Context } from "../../../../apiGateway";
import { PageInterface } from "../../../models/pageSchema";
import { PageController } from "../../../controllers/index";
export const Create = async (payload: PageInterface,context : Context) => {
    let control = new PageController();  
    console.log("CREATE PAGE PAYLOAD ",payload)  
    let results = await control.createPage(payload, context);
    return results
}


export default Create