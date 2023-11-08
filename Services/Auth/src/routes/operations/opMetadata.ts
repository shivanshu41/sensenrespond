import { v4 } from "uuid"
import { Context } from "../../../apiGateway"
export class OperationalMetadata{
    operationId : string
    context : Context | null
    constructor(context : Context | null){
        this.operationId = v4()
        this.context = context || null
    }
}