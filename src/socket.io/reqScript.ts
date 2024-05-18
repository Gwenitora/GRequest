import { requ, Request } from "@gscript/grequest";
import { json } from "@gscript/gtools";
import { json_type } from "@gscript/gtools/lib/cjs/json/type";

export class ReqScriptSocketIo extends Request {
    link: string = "/socketio/:file";
    type: requ.type = requ.type.PUBLIC;
    callType: requ.callType = requ.callType.GET;
    authLevel: string | boolean = true;
    inTemplates: json.template[] = [];
    outTemplates: json.template[] = [];
    secret: boolean = false;

    start(): boolean {
        return true;
    }
    
    async run(req: requ.requestContent): Promise<requ.requestResponse> {
        return {resFile: "./node_modules/socket.io/client-dist/" + req.linkVar.file, resCode: requ.httpCodes._200_Success._200_OK};
    }
}