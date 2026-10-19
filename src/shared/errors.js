// AppError class and error-to-HTTP mapping
import {ZodError} from "zod";
import { MongoNetworkError, MongoServerSelectionError } from "mongodb";

export class AppError extends Error{
    constructor(status,message){
        super(message);
        this.status=status;
    }
}

export function toHttpError(err){
    if(err instanceof ZodError){
        return{
            status:422,
            body:{detail:err.issues.map((i)=>`${i.path.join(".")}: ${i.message}`)}
        };
    }
    if(err instanceof AppError){
        return{
            status:err.status,body:{detail:err.message}
        }
    }
    if(err instanceof MongoServerSelectionError || err instanceof MongoNetworkError){
        return{status:503,body:{detail:"Database is temporarily unavailable. Please try again later"}}
    }
    console.error(err);
    return{status:500,body:{detail:"Internal Server Error"}};
}

export function sendError(res,err){
    if(res.headersSent) return;
    const{status,body}=toHttpError(err);
    const payload=JSON.stringify(body);
    res.writeHead(status,{
        "Content-Type":"application/json; charset=utf-8",
        "Content-Length":Buffer.byteLength(payload),
    });
    res.end(payload)
}