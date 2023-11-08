import { OperationalMetadata } from "./src/routes/operations/opMetadata"
import {Express} from 'express';
export interface Context {
    request : Express.Request
    response : Express.Response
}

export class Gateway {
    private readonly request : Express.Request
    private readonly response : Express.Response
    metadata : any
    constructor(requestObj:Express.Request,responseObj:Express.Response){
        this.request = requestObj
        this.response = responseObj
        this.metadata = new OperationalMetadata(this.getCurrentContext())
    }

    getCurrentContext(){
        
        return {
            metaclass : this.metadata,
            request : this.request ,
            response : this.response
        }
    }
}