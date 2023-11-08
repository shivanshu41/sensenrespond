//@ts-nocheck
import { Context } from "../../../apiGateway";
import { Gateway } from "../../../apiGateway"
import { PageInterface } from "../../models/pageSchema";
import { Create } from "./Create";
import CreatePost from "./CreatePost";

export enum POST_OPS {
    create = 'CREATE',
    createPost = 'CREATEPOST',
}

interface OPERATION_RESPONSE {
    data: {} | any[],
    status: string,
    success: boolean,
    message: string

}
interface OPERATION_METHOD {
    (payload: PageInterface , context :Context): any
}

type OPERATION_SET = {
    [key in POST_OPS]: OPERATION_METHOD

}
/**
 * @class
 * This class is used to execute operation on basis of operation set that is provided in the constructor.
 * The operation set can also be in any form be it JSON or any other 
 */
export class OPERATION extends Gateway {
    operation: POST_OPS.create
    operationMethod?: OPERATION_METHOD
    private readonly operationSet: OPERATION_SET
    private readonly currentContext : Context
    constructor(operation: POST_OPS.create , req:Express.Request,res:Express.Response) {
        super(req,res);
        this.operation = operation
        this.currentContext = this.getCurrentContext(); 
            
        this.operationMethod = undefined
        this.operationSet = {
            // this set can also be in form of JSON or any other
            [POST_OPS.create]: Create,         
            [POST_OPS.createPost]: CreatePost,
        }
    }
    /**
     * @member execute used to execute the operation set in the constructor.
     * Note - This method requires the this.set() to correctly set the operation instance
     * @returns 
     */
    public async execute(payload: any) {
        // Execute the operation method by determining the exact operation
        let results = await this.operationMethod && this.operationMethod!.call(this, payload,this.currentContext);
        return results
    }
    /**
     *  
     * @returns 
     */
    public set() {
        // Set the operation method here
        // first get the operation
        let operationKey = this.operation.toString();
        //@ts-ignore
        this.operationMethod = this.operationSet[operationKey];
        return false

    }

}