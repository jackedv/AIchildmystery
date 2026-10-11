import http from "node:http";
import { readFile, stat, appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { createEvaluator, loadConfig, errorResult, validateAttempt, AiError } from "./ai.js";
const mime={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".png":"image/png",".jpg":"image/jpeg",".mp3":"audio/mpeg"};
function json(res,body,status=200) { res.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"});res.end(JSON.stringify(body)); }
export async function createGameServer({root,config,evaluate,journal=true,attemptTimeoutMs=165000}) {
  config ||= await loadConfig(root);
  evaluate ||= createEvaluator({root,config});
  let running=false;
  return http.createServer(async(req,res)=>{
    res.setHeader("X-Content-Type-Options","nosniff");
    // Only local browser requests. Credentials are never exposed through static serving.
    if(!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(req.headers.host || "")) return json(res,{error:"local_only"},403);
    if(req.headers.origin && req.headers.origin!=="http://"+req.headers.host) return json(res,{error:"origin"},403);
    let pathname;
    try { pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname); } catch { return json(res,{error:"path"},400); }
    if(pathname==="/api/health" && req.method==="GET") return json(res,{app:"ai-child-mystery",version:2,configured:!!config.key});
    if(pathname==="/api/attempt" && req.method==="POST") {
      if(running) return json(res,{status:"system_error",message:"还有一个想法正在思考，请稍等。"},409);
      running=true;
      const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),attemptTimeoutMs);
      res.on("close",()=>{if(!res.writableEnded)controller.abort();});
      let body;
      try {
        const chunks=[]; let size=0;
        for await(const chunk of req) { size+=chunk.length; if(size>12000) throw new AiError("invalid");chunks.push(chunk); }
        try { body=JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new AiError("invalid"); }
        const valid=validateAttempt(body);
        if(journal) { await mkdir(path.join(root,".local"),{recursive:true}); await appendFile(path.join(root,".local","attempts.jsonl"),JSON.stringify({at:new Date().toISOString(),text:valid.text,clarifications:valid.context.length})+"\n","utf8"); }
        const result=await evaluate(body,controller.signal);
        if(!res.destroyed) json(res,result);
      } catch(error) { if(!res.destroyed) json(res,errorResult(error)); }
      finally {clearTimeout(timer);running=false;}
      return;
    }
    if(!["GET","HEAD"].includes(req.method)) return json(res,{error:"method"},405);
    const file=pathname==="/"?"index.html":pathname.slice(1);
    if(!/^(index\.html|styles\.css|src\/[a-z-]+\.js|assets\/[a-zA-Z0-9_./-]+)$/.test(file) || file.split("/").includes("..")) return json(res,{error:"not_found"},404);
    const absolute=path.resolve(root,file);
    if(!absolute.startsWith(path.resolve(root)+path.sep)) return json(res,{error:"not_found"},404);
    try {
      const info=await stat(absolute); if(!info.isFile()) throw new Error("not file");
      const type=mime[path.extname(file)]; if(!type) throw new Error("unsupported");
      const bytes=await readFile(absolute);
      res.writeHead(200,{"Content-Type":type,"Content-Length":bytes.length,"Cache-Control":"no-cache"});
      res.end(req.method==="HEAD"?undefined:bytes);
    } catch { json(res,{error:"not_found"},404); }
  });
}
