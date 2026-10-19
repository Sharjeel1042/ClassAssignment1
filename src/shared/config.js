// Environment configuration (MONGO_URI, MONGO_DB, PORT, ALLOCATION_FAIL, ALLOCATION_TIMEOUT_MS)
export const MONGO_URI=process.env.MONGO_URI;
export const MONGO_DB=process.env.MONGO_DB ?? "admissions";
export const PORT=Number(process.env.PORT ?? 3000);
export const ALLOCATION_FAIL=process.env.ALLOCATION_FAIL==="1";
export const ALLOCATION_TIMEOUT_MS=Number(process.env.ALLOCATION_TIMEOUT_MS ?? 2000);

if(!MONGO_URI){
    throw new Error("MONGO_URI is not set.")
}