// Zod schemas for application submission and admission decisions
import {z} from "zod"

export const applicationIn=z.object({
    name:z.string().trim().min(2).max(100),
    email:z.email(),
    program_id:z.string().min(1),
    gpa:z.number().min(0).max(4)
});

export const decisionIn=z.object({
        decision:z.enum(["ADMITTED","REJECTED"]),
})