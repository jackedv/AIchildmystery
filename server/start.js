import path from "node:path";
import { fileURLToPath } from "node:url";
import { createGameServer } from "./http.js";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const server=await createGameServer({root});
const port=Number(process.env.GAME_PORT || 4173);
server.listen(port,"127.0.0.1",()=>console.log("故事书已打开：http://127.0.0.1:"+port+"/"));
server.on("error",error=>{console.error(error.code==="EADDRINUSE"?"故事书已经运行，或本机端口被占用。请打开 http://127.0.0.1:"+port+"/ ，或关闭占用端口的程序后重试。":"启动失败，请检查本地运行环境。");process.exitCode=1;});
process.on("SIGINT",()=>server.close(()=>process.exit(0)));
