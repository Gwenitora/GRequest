import { json, typeExt } from "@gscript/gtools";
import { req } from "../export";
import { GRequest } from "../GRequest";

export abstract class Request extends GRequest  {
    abstract link : string;
    abstract type : req.type;
    abstract callType : req.callType;
    abstract authLevel: string | boolean;
    abstract inTemplates : json.template[];
    abstract outTemplates : json.template[];
    abstract secret : boolean;

    abstract start(): boolean;
    abstract run(template: number, body: json.type, header: typeExt<json.type, {[key in string] : string}>, linkVar: typeExt<json.type, {[key in string]: string}>, query: typeExt<json.type, {[key in string]: string}>): Promise<{resBody: json.type, resCode: req.HTTPerror}>;
}