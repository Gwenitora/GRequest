import { requ, Request } from "@gscript/grequest";
import { json_template, json_type } from "@gscript/gtools/lib/cjs/json/type";

export class ReqScriptSocketIo extends Request {
    link: string = "/socketio";
    type: requ.type = requ.type.PUBLIC;
    callType: requ.callType = requ.callType.GET;
    authLevel: string | boolean = true;
    inTemplates: json_template[] = [];
    outTemplates: json_template[] = [];
    secret: boolean = false;

    start(): boolean {
        return true;
    }
    
    async run(template: number, body: json_type, header: { [x: string]: string; }, linkVar: { [x: string]: string; }, query: { [x: string]: string; }): Promise<{ resBody: json_type; resCode: requ.httpCodes.all; }> {
        return {resBody: {message: "Hello World"}, resCode: requ.httpCodes._200_Success._200_OK};
    }
}