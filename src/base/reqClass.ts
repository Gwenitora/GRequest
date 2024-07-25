import { json, typeExt } from "@gscript/gtools";
import { requ } from "../export";
import { GRequest } from "../GRequest";

/**
 * Template of request class for make detectable by the manager.
 */
export abstract class Request extends GRequest  {
    /**
     * Link of the request.
     * 
     * @example "/hw"
     * @example "/hello/world"
     * @example "/mod/:id/version"
     */
    abstract link : string;
    /**
     * Type of the request.
     * It's here you define if the request is public or private.
     */
    abstract type : requ.type;
    /**
     * Type of the call.
     * It's here you define if the request is a `GET`, `POST`, `PUT`, `PATCH` or `DELETE`.
     */
    abstract callType : requ.callType;
    /**
     * Auth level of the request.
     * 
     * true signifie that request have a authFunction return every time true, and everyone can access to this command.
     * false signifie that request have a authFunction return every time false, and no one can access to this command.
     * 
     * If you have create different auth level, you can put the name of the auth level here.
     * But if the auth level is not define, the script is shutdown with an error.
     */
    abstract authLevel: string | boolean;
    /**
     * Templates of the request.
     * You can make multiple templates for the request.
     * The id of template is the index in the array, this id is send to you when a request is execute.
     */
    abstract inTemplates : json.template[];
    /**
     * Templates your response.
     * If your response is not in the template, an internal error will send to the client.
     */
    abstract outTemplates : json.template[];
    /**
     * If the request is secret the helper is automatically disable for this request only.
     * And the unauthorize http code is replace by the not found http code.
     * That is for protect your command.
     * 
     * You can also choose to disable the command or the helper, but if one of them is disable, the other is automatically enable, and same for the invert.
     */
    abstract secret : boolean | { command?: true, helper: false } | { command: true, helper?: false } | { command?: false, helper: true } | { command: false, helper?: true };

    /**
     * Version of the request.
     * If you define this parameter, the version (in int) is ad after the prefix of the link.
     */
    public version: number = -1;

    /**
     * Start function of the request.
     * This function is call when the manager is init.
     */
    abstract start(): boolean;
    /**
     * Run is called when the request is execute, and conditions is respects (`auth`, `inTemplates`..).
     * 
     * @param req The request content, with the body, the headers, the params, the query and the files.
     * @returns The response of the request, with the body response and the status code.
     */
    abstract run(datas: requ.requestContent): Promise<requ.requestResponse>;
}