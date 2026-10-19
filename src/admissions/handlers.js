// HTTP handlers for /applications routes
import { applicationIn,decisionIn } from "./schemas.js";
import * as service from "./service.js";

export function registerAdmissions(router){
    router.post("/applications",async({body})=>{
        const data=applicationIn.parse(body);
        return{status:201,body:await service.submitApplication(data)};
    });

    router.get("/applications/:id",async({params})=>{
        return{body:await service.getApplication(params.id)};
    });

    router.get("/applications/:id/eligibility",async({params})=>{
        return{body:await service.checkEligibility(params.id)};
    });

    router.patch("/applications/:id/decision",async({params,body})=>{
        const data=decisionIn.parse(body);
        return{body:await service.decide(params.id,data.decision)};
    });
}