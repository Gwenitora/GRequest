import { requ, Request } from "@gscript/grequest";
import { json } from "@gscript/gtools";

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
    
    async run(template: number, body: json.type, header: { [x: string]: string; }, linkVar: { [x: string]: string; }, query: { [x: string]: string; }): Promise<{ resFile: string; resCode: requ.httpCodes.all; }> {
        return {resFile: "./node_modules/socket.io/client-dist/" + query.file, resCode: requ.httpCodes._200_Success._200_OK};
    }
}