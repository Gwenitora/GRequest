import { Request } from "@gscript/grequest";
import { GRequest } from "../GRequest";
import { getClasses } from "@gscript/gtools";

export class reqManager extends GRequest {
    private static requests: Request[] = [];

    public static init() {
        reqManager.requests = getClasses(Request);
    }
}