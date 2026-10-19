import {createServer} from "node:http";
import { createRouter } from "./http/router.js";
import { sendError } from "./shared/errors.js";
import {registerAdmissions} from "./admissions/handlers.js";
import {registerEnrollment} from "./enrollment/handlers.js";


export function createApp(){
    const router=createRouter();
    registerAdmissions(router);
    registerEnrollment(router);


    return createServer((req,res)=>{
        router.handle(req,res).catch((err)=>sendError(res,err));
    });
}
