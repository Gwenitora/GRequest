import { Request } from "./reqClass";
import { GRequest } from "../GRequest";
import { colors, debug, env, getClasses, img, json, typeExt } from "@gscript/gtools";
import express from 'express'
import { req, requ, resu } from '@gscript/grequest'

export class reqManager extends GRequest {
    private static requests: Request[] = [];
    private static authsFuncs: { [key in string]: (header: json.type) => boolean } = {};
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

    public static activeImgLinks(value: boolean): typeof reqManager {
        img.eventUpdateCache().removeEvent("LinkUpdater by @GScript/GRequest");
        if (value) {
            img.eventUpdateCache().addOnEvent("LinkUpdater by @GScript/GRequest", (datas) => {
                for (let i = 0; i < datas.length; i++) {
                    if (datas[i].path.split(" ").length !== 1) {
                        img.editLink(datas[i].id, "The path is invalid because contain one or more space(s) !!");
                        continue;
                    }
                    img.editLink(datas[i].id, (env.API_DOMAIN ? env.API_DOMAIN : "http://localhost") + ':' + reqManager.port + "/img" + datas[i].path.split("." + img.path())[1]);
                }
            })
            img.updateCache();
        }
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

        reqManager.expressApp.get("/img/*", (requ: requ, resu: resu) => {
            let path = requ.path.split("/img/")[1];
            let name = path.split(".").splice(0, path.split(".").length - 1).join(".")
            let ext = path.split(".").splice(path.split(".").length - 1)[0];
            path = img.path() + name + '.' + ext;

            let Img = img.getImg(name, {ext, path});

            if (Img === undefined || Img[0].link.split(" ").length !== 1) {
                resu.status(req.HTTPerror.NotFound).json("Command not found").send();
                return;
            }

            resu.status(req.HTTPerror.OK).sendFile(Img[0].path);
        });

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
                if (message === "") return;
                debug.log(message.replaceAll("{{port}}", reqManager.port.toString()));
                return;
            }
            debug.log(colors.fg.green + "Server is running on port " + reqManager.port);
        });
    }

    private static execute(cmd: Request, requ: requ, resu: resu): void {
        let header = requ.headers as { [key in string]: string };
        let body = requ.body;
        let linkVar = requ.params as { [key in string]: string };
        let query = requ.query as { [key in string]: string };

        const res = reqManager.executeDirect(cmd.link, cmd.callType, false, { body, header, linkVar, query }).then((result) => {
            resu.status(result.resCode).json(result.resBody).send();
        });
    }

    public static async executeDirect<T extends boolean>(link: string, callType: req.callType, forceAuth: T, options: T extends true ? {
        body?: json.type,
        header?: undefined,
        linkVar?: typeExt<json.type, { [key in string]: string }>,
        query?: typeExt<json.type, { [key in string]: string }>
    } : {
        body?: json.type,
        header?: typeExt<json.type, { [key in string]: string }>,
        linkVar?: typeExt<json.type, { [key in string]: string }>,
        query?: typeExt<json.type, { [key in string]: string }>
    }): Promise<{ resBody: json.type, resCode: req.HTTPerror }> {
        let finded = false;
        let posJ = -1;
        for (var i = 0; i < reqManager.requests.length; i++) {
            if (reqManager.requests[i].callType === callType && reqManager.requests[i].link === link) {
                finded = true;
                posJ = i;
                break;
            }
        }
        if (!finded) {
            return { resBody: "Command not found", resCode: req.HTTPerror.NotFound };
        }
        let cmd: Request = reqManager.requests[posJ];

        let header = options.header;
        let body = options.body;
        let linkVar = options.linkVar;
        let query = options.query;
        let template = -1;
        if (header === undefined) header = {};
        if (linkVar === undefined) linkVar = {};
        if (query === undefined) query = {};

        if (!forceAuth) {
            if (cmd.authLevel === false || (typeof cmd.authLevel === "string" && !reqManager.authsFuncs[cmd.authLevel](header))) {
                if (cmd.secret) {
                    return { resBody: "Command not found", resCode: req.HTTPerror.NotFound };
                } else {
                    return { resBody: "Unauthorized", resCode: req.HTTPerror.Unauthorized };
                }
            }
        }

        for (let i = 0; i < cmd.inTemplates.length; i++) {
            if (json.IsRespectTemplate(body, cmd.inTemplates[i], true) === null) continue;
            body = json.IsRespectTemplate(body, cmd.inTemplates[i], true) as any;
            template = i;
            break;
        }

        if (template === -1 && cmd.inTemplates.length > 0) {
            return { resBody: "Bad request", resCode: req.HTTPerror.BadRequest };
        }
        if (cmd.inTemplates.length === 0) {
            body = undefined;
        }

        try {
            const result = await cmd.run(template, body, header as any, linkVar as any, query as any);
            if ((cmd.outTemplates.length === 0 && (result.resBody === undefined || typeof result.resBody === "string")) || (cmd.outTemplates.length !== 0 && json.IsRespectOneTemplate(result.resBody, cmd.outTemplates, true) !== null)) {
                if (cmd.outTemplates.length !== 0) result.resBody = json.IsRespectOneTemplate(result.resBody, cmd.outTemplates, true) as json.type;
                return result;
            }
            debug.logErr("Internal server error due to bad response template in " + cmd.link + " command");
            return { resBody: "Internal server error", resCode: req.HTTPerror.InternalServerError };
        } catch (err) {
            debug.logErr("Internal server error due to promise rejection in " + cmd.link + " command");
            return { resBody: "Internal server error", resCode: req.HTTPerror.InternalServerError };
        }
    }
}