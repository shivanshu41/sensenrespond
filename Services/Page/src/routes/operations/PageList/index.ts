import { Context } from "../../../../apiGateway";
import { PageController } from "../../../controllers/index";

export const PageList = async (ownerId : string,context : Context) => {
    let control = new PageController();    
    let results = await control.getPages(ownerId, context);
    return results
}

export default PageList