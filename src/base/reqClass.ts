import { json } from "@gscript/gtools";
import { req } from "../export";
import { GRequest } from "../GRequest";

export abstract class Request extends GRequest  {
    abstract link : string;
    abstract type : req.type;
    abstract inTemplates : json.template[];
    abstract outTemplates : json.template[];

    abstract start(): boolean;
    abstract run(body : json.type, template: number, ): Promise<{resBody: json.type, resCode: req.HTTPerror}>;
}