import { Request, Response } from "express";

export interface CustomExpressResponse extends Response {
    result:any
}

export interface CustomExpressRequest extends Request {
    user : any
}