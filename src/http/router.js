import { AppError } from "../shared/errors.js";

const MAX_BODY_BYTES=1_000_000;


export function createRouter(){
    const routes=[];


    function add(method,pattern,handler){
        const keys=[];
        const source=pattern.replace(/:(\w+)/g, (_, key)=>{
            keys.push(key);
            return "([^/]+)";
        });
        routes.push({ method, regex: new RegExp(`^${source}/?$`), keys, handler });
    }

    async function handle(req,res){
        const url=new URL(req.url,"https://localhost");
        let pathMatched= false


        for(const route of routes){
            const match=url.pathname.match(route.regex);
            if(!match) continue;
            pathMatched=true;
            if(route.method!==req.method)continue;

            const params={};
            route.keys.forEach((key,i)=>{
                params[key]=decodeParam(match[i+1]);
            });

            const body=await readJson(req);
             const result = await route.handler({ params, body, query: url.searchParams });
            return send(res, result?.status ?? 200, result?.body);
        }
        if(pathMatched) throw new AppError(405,"Method not allowed");
        throw new AppError(404,"Route not found")
    }

    return{
        get:(pattern,handler)=>add("GET",pattern,handler),
        post:(pattern,handler)=>add("POST",pattern,handler),
        patch:(pattern,handler)=>add("PATCH",pattern,handler),
        handle
    };
}


function decodeParam(value){
    try{
        return decodeURIComponent(value);
    }catch{
        throw new AppError(400,"Malformed URL")
    }
}


async function readJson(req){
    if(req.method==="GET" || req.method==="HEAD") return undefined;

    const chunks=[];
    let size=0;
    for await(const chunk of req){
        size=size+chunk.length;
        if(size>MAX_BODY_BYTES) throw new AppError(413,"Request body is too large");
        chunks.push(chunk)
    }

    if(chunks.length===0) return{};
    try{
        return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    }catch{
        throw new AppError(400, "Malformed JSON body");
    }
}



export function send(res,status,body){
    if(res.headersSent) return;
    const payload=body=== undefined ? "":JSON.stringify(body);
    res.writeHead(status,{"Content-Type":"application/json; charset=utf-8",
        "Content-Length":Buffer.byteLength(payload)
    });

    res.end(payload)
}