// Admissions business logic: submit, track, eligibility, decide
import {randomUUID} from "node:crypto";
import { db } from "../shared/db.js";
import { AppError } from "../shared/errors.js";

export async function submitApplication(data) {
    const program=await db.collection("programs").findOne({_id:data.program_id});
    if(!program) throw new AppError(404,"Program not found");


    const applicant=await db.collection("applicants").findOneAndUpdate(
        {email:data.email},
        {$setOnInsert:{_id:randomUUID(),email:data.email,name:data.name}},
        {upsert:true,returnDocument:"after"}
    );


    const application={
        _id:randomUUID(),
        applicant_id:applicant._id,
        program_id:program._id,
        gpa:data.gpa,
        status:"SUBMITTED",
        submittedAt:new Date()
    };

    try{
        await db.collection("applications").insertOne(application);
    }catch(err){
        if(err.code===11000){
            throw new AppError(409,"This applicant has already applied to this program")
        }
        throw err;
    }
    return application;
    
}


export async function getApplication(id){
    const app=await db.collection("applications").findOne({_id:id});
    if(!app) throw new AppError (404,"Application not found");
    return app;
}


export async function checkEligibility(id){
    const app=await getApplication(id);
    const program=await db.collection("programs").findOne({_id:app.program_id});
    if(!program) throw new AppError(404,"Program not found");
    const eligible=app.gpa>=program.min_gpa;
    return{
        eligible,
        reason:eligible?null : `Applicant's GPA of ${app.gpa} is lower than the program's required minimum gpa of ${program.min_gpa}`
    };
}


export async function decide(id,decision){
    const app=await getApplication(id);

    if(decision==="ADMITTED"){
        const {eligible}=await checkEligibility(id)
        if(!eligible) throw new AppError(422,"Applicant is not eligible for admission")
    }


    const updated=await db.collection("applications").findOneAndUpdate(
        {_id:id,status:"SUBMITTED"},
        {$set:{status:decision, decided_at:new Date() }},
        {returnDocument:"after"}
    );

    if(!updated) throw new AppError(409,`Application already has status ${app.status}`);
    return updated;
}