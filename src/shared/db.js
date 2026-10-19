// MongoDB client, database handle, and ensureIndexes()
import { MongoClient } from "mongodb";
import {MONGO_URI,MONGO_DB} from "./config.js"

export const client=new MongoClient(MONGO_URI, {serverSelectionTimeoutMS:5000});
export const db=client.db(MONGO_DB);

export async function connect(){
    await client.connect();
}


export async function ensureIndexes(){
    await db.collection("applicants").createIndex({email:1},{unique:true});
    await db.collection("applications").createIndex({applicant_id:1,program_id:1},{unique:true});
    await db.collection("courses").createIndex({program_id:1});
    await db.collection("enrollments").createIndex({student_id:1,course_id:1},{unique:true})
}