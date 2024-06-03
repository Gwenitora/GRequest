import { requ, Request } from "@gscript/grequest";
import { json } from "@gscript/gtools";

export class ReqScriptSocketIo extends Request {
    link: string = "/socket.io/:file";
    type: requ.type = requ.type.PUBLIC;
    callType: requ.callType = requ.callType.GET;
    authLevel: string | boolean = true;
    inImgs: json.objPersoType<boolean, false> = {};
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