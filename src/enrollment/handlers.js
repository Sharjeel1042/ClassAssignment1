// HTTP handlers for /enrollments routes
import {z} from "zod";
import {enroll} from "./service.js";

const enrollIn=z.object({
    application_id:z.string(),
    course_id:z.string()
});

export function registerEnrollment(router){
    router.post("/enrollments",async({body})=>{
        const data=enrollIn.parse(body);
        return{status:201,body:await enroll(data.application_id,data.course_id)};
    });
}