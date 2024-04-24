import { Request } from "./reqClass";
import { GRequest } from "../GRequest";
import { getClasses, json } from "@gscript/gtools";
import express from 'express'
import { req, requ, resu } from '@gscript/grequest'

export class reqManager extends GRequest {
    private static requests: Request[] = [];
    private static authsFuncs: {[key in string]: (header: json.type) => boolean} = {};
    private static expressApp: express.Application = express();
    private static port: number = 3000;

    public static setPort(port: number): typeof reqManager {
        reqManager.port = port;
        return reqManager;
    }

    public static createAuthLevel(name: string, func: (header: json.type) => boolean): typeof reqManager {
        reqManager.authsFuncs[name] = func;
        return reqManager;
    }

    public static init() {
        reqManager.requests = getClasses(Request);
        this.expressApp.use(express.json())

        for (let i = 0; i < reqManager.requests.length; i++) {
            if (typeof reqManager.requests[i].authLevel === "string" && reqManager.authsFuncs[reqManager.requests[i].authLevel as string] === undefined) {
                throw new Error("Auth level of " + reqManager.requests[i].authLevel + " not found");
            }
            if (!reqManager.requests[i].start()) {
                throw new Error("Request " + reqManager.requests[i].link + " failed to start");
            }
        }

        for (let i = 0; i < reqManager.requests.length; i++) {
            reqManager.expressApp[reqManager.requests[i].callType](reqManager.requests[i].link, (requ: requ, resu: resu) => {
                reqManager.execute(reqManager.requests[i], requ, resu);
            });
        }

        reqManager.expressApp.listen(reqManager.port, () => {
            console.log("Server is running on port " + reqManager.port);
        });
    }

    private static execute(cmd: Request, requ: requ, resu: resu): void {
        let header = requ.headers;
        let body = requ.body;
        let linkVar = requ.params;
        let query = requ.query;
        let template = -1;

        if (cmd.authLevel === false || (typeof cmd.authLevel === "string" && !reqManager.authsFuncs[cmd.authLevel])) {
            if (cmd.secret) {
                resu.status(req.HTTPerror.NotFound).json("Command not found").send();
            } else {
                resu.status(req.HTTPerror.Unauthorized).json("Unauthorized").send();
            }
            return;
        }

        for (let i = 0; i < cmd.inTemplates.length; i++) {
            if (json.IsRespectTemplate(body, cmd.inTemplates[i], true) === null) continue;
            template = i;
            break;
        }

        if (template === -1) {
            resu.status(req.HTTPerror.BadRequest).json("Bad request").send();
            return;
        }

        cmd.run(template, body, header, linkVar, query as any).then((result) => {
            if (json.IsRespectOneTemplate(result.resBody, cmd.outTemplates, true) === null) {
                resu.status(result.resCode).json(result.resBody).send();
            } else {
                resu.status(req.HTTPerror.InternalServerError).json("Internal server error").send();
            }
        }).catch((err) => {
            resu.status(req.HTTPerror.InternalServerError).json("Internal server error").send();
        });
    }
}