import { NextFunction, Request, Response } from "express";
import { CustomExpressRequest, CustomExpressResponse } from "../src/@types/rootType";

export const responseHandler = (req:CustomExpressRequest,res:CustomExpressResponse,next:NextFunction)=>{
  
        let result = res.result;
        res.json({ ...result, executor: req.user })
     
}