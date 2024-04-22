import { Request } from "@gscript/grequest";
import { GRequest } from "../GRequest";
import { getClasses } from "@gscript/gtools";

export class reqManager extends GRequest {
    private requests: Request[] = [];

    public init() {
        this.requests = getClasses(Request);
    }
}