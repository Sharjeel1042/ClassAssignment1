import {PORT} from "./shared/config.js";
import {connect,ensureIndexes} from "./shared/db.js";
import {createApp} from "./app.js";


await connect();
await ensureIndexes();


createApp().listen(PORT,()=>{
    console.log(`Running on port ${PORT}`)
});
