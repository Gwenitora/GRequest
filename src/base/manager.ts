import { Request } from "./reqClass";
import { GRequest } from "../GRequest";
import { debug, getClasses, json } from "@gscript/gtools";
import express from 'express'
import { req, requ, resu } from '@gscript/grequest'

export class reqManager extends GRequest {
    private static requests: Request[] = [];
    private static authsFuncs: {[key in string]: (header: json.type) => boolean} = {};
    private static expressApp: express.Application = express();
    private static port: number = 3000;
    private static helper: boolean = false;

    public static setHelper(value: boolean): typeof reqManager {
        reqManager.helper = value;
        return reqManager;
    }

    public static setPort(port: number): typeof reqManager {
        reqManager.port = port;
        return reqManager;
    }

    public static createAuthLevel(name: string, func: (header: json.type) => boolean): typeof reqManager {
        reqManager.authsFuncs[name] = func;
        return reqManager;
    }

    public static init(): typeof reqManager {
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
            if (reqManager.requests[i].type === req.type.PRIVATE) continue;

            reqManager.expressApp[reqManager.requests[i].callType](reqManager.requests[i].link, (requ: requ, resu: resu) => {
                reqManager.execute(reqManager.requests[i], requ, resu);
            });

            if (reqManager.requests[i].secret) continue;

            if (reqManager.helper) {
                reqManager.expressApp[reqManager.requests[i].callType](reqManager.requests[i].link + "/help", (requ: requ, resu: resu) => {
                    let help = {
                        link: reqManager.requests[i].link,
                        type: reqManager.requests[i].type,
                        callType: reqManager.requests[i].callType,
                        authLevel: reqManager.requests[i].authLevel,
                        inTemplates: reqManager.requests[i].inTemplates,
                        outTemplates: reqManager.requests[i].outTemplates
                    }
                    resu.status(req.HTTPerror.OK).json(help).send();
                });
            }
        }
        
        for (const call in req.callType) {
            reqManager.expressApp[req.callType[call as keyof typeof req.callType]]("*", (requ: requ, resu: resu) => {
                resu.status(req.HTTPerror.NotFound).json("Command not found").send();
            });
        }

        return reqManager;
    }

    public static start(message?: string): void {
        reqManager.expressApp.listen(reqManager.port, () => {
            if (message !== undefined) {
                console.log(message.replaceAll("{{port}}", reqManager.port.toString()));
                return;
            }
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
            body = json.IsRespectTemplate(body, cmd.inTemplates[i], true);
            template = i;
            break;
        }

        if (template === -1 && cmd.inTemplates.length > 0) {
            resu.status(req.HTTPerror.BadRequest).json("Bad request").send();
            return;
        }
        if (cmd.inTemplates.length === 0) {
            body = undefined;
        }

        cmd.run(template, body, header, linkVar, query as any).then((result) => {
            if ((cmd.outTemplates.length === 0 && (result.resBody === undefined || typeof result.resBody === "string")) || (cmd.outTemplates.length !== 0 && json.IsRespectOneTemplate(result.resBody, cmd.outTemplates, true) !== null)) {
                if (cmd.outTemplates.length !== 0) result.resBody = json.IsRespectOneTemplate(result.resBody, cmd.outTemplates, true) as json.type;
                resu.status(result.resCode).json(result.resBody).send();
            } else {
                resu.status(req.HTTPerror.InternalServerError).json("Internal server error").send();
                debug.logErr("Internal server error due to bad response template in " + cmd.link + " command");
            }
        }).catch((err) => {
            resu.status(req.HTTPerror.InternalServerError).json("Internal server error").send();
            debug.logErr("Internal server error due to promise rejection in " + cmd.link + " command");
        });
    }
}