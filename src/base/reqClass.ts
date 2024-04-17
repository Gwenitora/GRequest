import { json, typeExt } from "@gscript/gtools";
import { req } from "../export";
import { GRequest } from "../GRequest";

export abstract class Request extends GRequest  {
    abstract link : string;
    abstract type : req.type;
    abstract inTemplates : json.template[];
    abstract outTemplates : json.template[];

    abstract start(): boolean;
    abstract run(template: number, body: json.type, header: json.type, linkVar: typeExt<json.type, {[key in string]: string}>): Promise<{resBody: json.type, resCode: req.HTTPerror}>;
}