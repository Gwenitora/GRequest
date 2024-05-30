import { Request } from "./reqClass";
import { GRequest } from "../GRequest";
import { colors, debug, env, getClasses, img, json, Langs, maths, typeExt } from "@gscript/gtools";
import express from 'express'
import { req, res } from '..'
import { requ } from "../export";
import { readFileSync, rmSync } from "fs";
import fileUpload from "express-fileupload";
import sharp from "sharp";
import cors from "cors";

/**
 * For start, setup and manage Requests.
 */
export class reqManager extends GRequest {
    private static requests: Request[] = [];
    private static authsFuncs: json.objPersoType<(header: json.type) => Promise<boolean>> = {};
    private static expressApp: express.Application = express();
    private static port: number;
    private static helper: boolean = false;
    private static langActive: boolean = false;

    /**
     * getter for express app
     * 
     * @returns express app
     */
    public static get app(): express.Application {
        return reqManager.expressApp;
    }

    /**
     * Create an homonyme of every request to send you many help about the request (just add `/help` at the end of the link).
     * If a request is secret, the help will not be available but only for that one.
     * 
     * @param value True for activate the helper, false for deactivate it.
     * @returns reqManager for chaining call.
     */
    public static setHelper(value: boolean = true): typeof reqManager {
        this.port = env.API_PORT ? parseInt(env.API_PORT) : 3000;
        reqManager.helper = value;
        return reqManager;
    }

    /**
     * Create a new auth level, usable in the `authLevel` property of a request.
     * 
     * @param name The name of the auth level (use that name in the `authLevel` property of a request, and must be unique).
     * @param func The function to check if the user is allowed to use the command (with the header of the request as parameter, return true if the user is allowed, false otherwise).
     * @returns reqManager for chaining call.
     */
    public static createAuthLevel(name: string, func: (header: json.type) => Promise<boolean>): typeof reqManager {
        this.port = env.API_PORT ? parseInt(env.API_PORT) : 3000;
        reqManager.authsFuncs[name] = func;
        return reqManager;
    }

    /**
     * Activate the img links (useful for img commands).
     * For access to an img as extern request, use the path `/img/` followed by the path of the img in the img folder, and the img folder depending the config of your img class.
     * You can change the domain of the img by changing the `API_DOMAIN` in the env class, do not precise the port and do not close with a `/` like `http://localhost`, not like `http://localhost/` or `http://localhost:3000` or `http://localhost:3000/`.
     * if the domain is not set, the default domain is `http://localhost`.
     * 
     * @param value True for activate the img links, false for deactivate it.
     * @returns reqManager for chaining call.
     */
    public static activeImgLinks(value: boolean = true): typeof reqManager {
        this.port = env.API_PORT ? parseInt(env.API_PORT) : 3000;
        img.eventUpdateCache().removeEvent("LinkUpdater by @GScript/GRequest");
        if (value) {
            img.eventUpdateCache().addOnEvent("LinkUpdater by @GScript/GRequest", (datas) => {
                for (let i = 0; i < datas.length; i++) {
                    if (datas[i].path.split(" ").length !== 1) {
                        img.editLink(datas[i].id, "The path is invalid because contain one or more space(s) !!");
                        continue;
                    }
                    const datasSplit = datas[i].path.split("." + img.path());
                    img.editLink(datas[i].id, (env.API_DOMAIN ? env.API_DOMAIN : "http://localhost") + ':' + reqManager.port + "/img/auto" + datasSplit.splice(1, datasSplit.length - 1).join("." + img.path()));
                }
            })
        }
        img.updateCache();
        return reqManager;
    }

    /**
     * Activate the lang links (useful for lang commands).
     * For access to a lang as extern request, use the path `/lang/` followed by the id of the lang.
     * You can change the domain of the lang by changing the `API_DOMAIN` in the env class, do not precise the port and do not close with a `/` like `http://localhost`, not like `http://localhost/` or `http://localhost:3000` or `http://localhost:3000/`.
     * if the domain is not set, the default domain is `http://localhost`.
     * 
     * @param value True for activate the lang links, false for deactivate it.
     * @returns reqManager for chaining call.
     */
    public static activeLangLinks(value: boolean = true): typeof reqManager {
        this.port = env.API_PORT ? parseInt(env.API_PORT) : 3000;
        this.langActive = value;
        return reqManager;
    }

    /**
     * To setup all detect requests (execute the start method of all requests, and save it all of them).
     * All requests detected is all classes that extends the `Request` class.
     * 
     * @returns reqManager for chaining call.
     */
    public static init(): typeof reqManager {
        this.port = env.API_PORT ? parseInt(env.API_PORT) : 3000;
        reqManager.requests = getClasses(Request);
        this.expressApp.use(express.json());
        this.expressApp.use(fileUpload());
        this.expressApp.use(cors());

        for (let i = 0; i < reqManager.requests.length; i++) {
            if (typeof reqManager.requests[i].authLevel === "string" && reqManager.authsFuncs[reqManager.requests[i].authLevel as string] === undefined) {
                throw new Error("Auth level of " + reqManager.requests[i].authLevel + " not found");
            }
            if (!reqManager.requests[i].start()) {
                throw new Error("Request " + reqManager.requests[i].link + " failed to start");
            }
        }

        for (let i = 0; i < reqManager.requests.length; i++) {
            if (reqManager.requests[i].type === requ.type.PRIVATE) continue;

            reqManager.expressApp[reqManager.requests[i].callType](reqManager.requests[i].link, (requ: req, resu: res) => {
                try {
                    reqManager.execute(reqManager.requests[i], requ, resu);
                } catch (err) {
                    debug.logErr("Internal server error due to bad request in " + reqManager.requests[i].link + " command");
                    debug.logErr(`${colors.fg.yellow}The error is : ${colors.fg.red}${err}`)
                }
            });

            if (reqManager.requests[i].secret === true || (reqManager.requests[i].secret as { command: boolean }).command === false || (reqManager.requests[i].secret as { helper: boolean }).helper === true) continue;

            if (reqManager.helper) {
                reqManager.expressApp[reqManager.requests[i].callType](reqManager.requests[i].link + "/help", (req: req, resu: res) => {
                    let help = {
                        link: reqManager.requests[i].link,
                        type: reqManager.requests[i].type,
                        callType: reqManager.requests[i].callType,
                        authLevel: reqManager.requests[i].authLevel,
                        inTemplates: reqManager.requests[i].inTemplates,
                        outTemplates: reqManager.requests[i].outTemplates
                    }
                    resu.status(requ.httpCodes._200_Success._200_OK).json(help);
                });
            }
        }

        reqManager.expressApp.get("/img/:type/*", async (req: req, resu: res) => {
            const t = req.params.type;
            var T = req.params.type === "png" || req.params.type === "jpg" || req.params.type === "jpeg" || req.params.type === "webp" ? req.params.type : "auto";
            const TT = img.getExts().find((ext) => ext === T);

            const j = 1 + (T === 'auto' ? 0 : 1);

            for (let i = 0; i < j; i++) {
                let path = req.path.split("/img/" + t + '/').splice(1, req.path.split("/img/" + t + '/').length - 1).join("/img/" + t + '/');
                let name = path.split('/')[path.split('/').length - 1];
                name = name.split(".").splice(0, name.split(".").length - 1).join(".")
                let EXT = path.split(".").splice(path.split(".").length - 1)[0]
                let ext = T === 'auto' ? EXT : T;
                path = '/' + path;
                path = path.split("").splice(1, path.split("").length - 1).join("");
                path = path.split('.').splice(0, path.split('.').length -1).join('.');

                let Img = img.getImg(name, { ext, path });
                let ImgOther = img.getImg(name, { ext: EXT, path });

                if (i === 0 && Img !== undefined && Img[0].link.split(" ").length === 1) {
                    resu.status(requ.httpCodes._200_Success._200_OK).sendFile(Img[0].path, { root: __dirname + '/' + '../'.repeat(6) });
                    return;
                } else if (i === 1 && TT !== undefined && ImgOther !== undefined && ImgOther.filter((e) => e.link.split(" ").length === 1).length >= 1) {
                    ImgOther = ImgOther.filter((e) => e.link.split(" ").length === 1);
                    const r = maths.randint(0, 1_000_000_000).toString();
                    var shape = await sharp(ImgOther[0].path).toFormat(TT as "png" | "jpg" | "jpeg" | "webp").toFile('./' + r + '.tmp.' + TT);
                    resu.status(requ.httpCodes._200_Success._200_OK).sendFile('' + r + '.tmp.' + TT, { root: __dirname + '/' + '../'.repeat(6) });
                    setTimeout(() => {
                        rmSync('./' + r + '.tmp.' + TT)
                    }, 500)
                    return;
                }
                T = 'auto';
            }
            resu.status(requ.httpCodes._400_ClientError._404_NotFound).json("Command not found");
        });

        reqManager.expressApp.get("/lang/:id", (req: req, resu: res) => {
            if (!this.langActive) return;
            const id = req.params.id;
            let lang: json.type;
            if (id === "") {
                lang = Langs.lang;
            }
            if (lang === undefined) {
                lang = Langs.getLang({ lang: id });
            }
            if (lang === undefined) {
                lang = Langs.getLang({ REGION: id });
            }
            if (lang === undefined) {
                lang = Langs.getLang({ lg_RG: id });
            }
            if (lang === undefined) {
                resu.status(requ.httpCodes._400_ClientError._404_NotFound).json("Command not found");
                return;
            }
            resu.status(requ.httpCodes._200_Success._200_OK).json(lang);
        });

        for (const call in requ.callType) {
            reqManager.expressApp[requ.callType[call as keyof typeof requ.callType]]("*", (req: req, resu: res) => {
                resu.status(requ.httpCodes._400_ClientError._404_NotFound).json("Command not found");
            });
        }

        img.updateCache();

        return reqManager;
    }

    /**
     * Start the server.
     * You can setup the port in the `.env` file with the `API_PORT` variable, the default port is 3000.
     * You can finaly setup the domain of your api with the `API_DOMAIN` variable in the `.env` file, the default domain is `http://localhost`, and please, do not precise the port and do not close with a `/` like `http://localhost`, not like `http://localhost/` or `http://localhost:3000` or `http://localhost:3000/`.
     * 
     * @param message Message to display when the server is started, you can add `{{port}}` in your message to write the port at this place (if empty like "", no message will be displayed, and if not defined, default message will send).
     * @returns reqManager for chaining call.
     */
    public static start(message?: string): void {
        this.port = env.API_PORT ? parseInt(env.API_PORT) : 3000;
        reqManager.expressApp.listen(reqManager.port, () => {
            if (message !== undefined) {
                if (message === "") return;
                debug.log(message.replaceAll("{{port}}", reqManager.port.toString()));
                return;
            }
            debug.log(colors.fg.green + "Server is running on port " + reqManager.port);
        });
    }

    private static execute(cmd: Request, req: req, resu: res): void {
        let header = req.headers as json.objPersoType<string>;
        let body = req.body;
        let linkVar = req.params as json.objPersoType<string>;
        let query = req.query as json.objPersoType<string>;

        var files: requ.fileArrayWithSharp = req.files as requ.fileArrayWithSharp;
      
        if (files !== null && files !== undefined) {
          for (let key in files) {
      
            if (!Array.isArray(files[key])) {
              const file = files[key] as requ.UploadedFileWithSharp;
              if (file.mimetype.includes("image")) {
                const sharpImage = sharp(file.data);
                file.sharp = sharpImage;
              }
              continue;
            }
            
            const files2 = files[key] as requ.UploadedFileWithSharp[];
            for (let i = 0; i < files2.length; i++) {
              const file = files2[i];
              if (file.mimetype.includes("image")) {
                const sharpImage = sharp(file.data);
                file.sharp = sharpImage;
              }
            }
            
          }
        }

        reqManager.executeDirect(cmd.link, cmd.callType, false, { body, header, linkVar, query, files }).then((result) => {
            if (result.hasOwnProperty("resFile")) {
                try {
                    resu.sendFile((result as any).resFile, { root: __dirname + '/' + '../'.repeat(6) });
                } catch (err) {
                    debug.logErr("Internal server error due to bad file in " + cmd.link + " command");
                    debug.logErr(`${colors.fg.yellow}The error is : ${colors.fg.red}${err}`)
                    resu.json("Internal server error")
                    result.resCode = 500;
                }
            } else {
                resu.json((result as any).resBody);
            }
            resu.status(result.resCode);
        });
    }

    /**
     * Execute a command as local, it's also the only possibilities to execute a `PRIVATE` command.
     * 
     * @param link The string you have entered in the `link` property of the request.
     * @param callType If you want to use the `GET`, `POST`, `PUT`, `PATCH` or `DELETE` method.
     * @param forceAuth To access force access, if is false and command need authorisation, you need to send the header with a valid connection for this request.
     * @param options All possible options for the request. Please forgot no one, thanks
     * @returns A promise with the response body and the response code.
     */
    public static async executeDirect<T extends boolean>(link: string, callType: requ.callType, forceAuth: T, options: T extends true ? {
        body?: json.type,
        header?: undefined,
        linkVar?: typeExt<json.type, json.objPersoType<string>>,
        query?: typeExt<json.type, json.objPersoType<string>>,
        files?: requ.fileArrayWithSharp
    } : {
        body?: json.type,
        header?: typeExt<json.type, json.objPersoType<string>>,
        linkVar?: typeExt<json.type, json.objPersoType<string>>,
        query?: typeExt<json.type, json.objPersoType<string>>,
        files?: requ.fileArrayWithSharp
    }): Promise<{ resBody: json.type, resCode: requ.httpCodes.all } | { resFile: string, resCode: requ.httpCodes.all }> {
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
            return { resBody: "Command not found", resCode: requ.httpCodes._400_ClientError._404_NotFound };
        }
        let cmd: Request = reqManager.requests[posJ];

        let header = options.header;
        let body = options.body;
        let linkVar = options.linkVar;
        let query = options.query;
        let files = options.files;
        let template = -1;
        if (header === undefined) header = {};
        if (body === undefined) body = {};
        if (linkVar === undefined) linkVar = {};
        if (query === undefined) query = {};
        if (files === undefined) files = {};

        if (!forceAuth) {
            if (cmd.authLevel === false || (typeof cmd.authLevel === "string" && !(await reqManager.authsFuncs[cmd.authLevel](header)))) {
                if (cmd.secret === true || (cmd.secret as { command: boolean }).command === true || (cmd.secret as { helper: boolean }).helper === false) {
                    return { resBody: "Command not found", resCode: requ.httpCodes._400_ClientError._404_NotFound };
                } else {
                    return { resBody: "Unauthorized", resCode: requ.httpCodes._400_ClientError._401_Unauthorized };
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
            return { resBody: "Bad request", resCode: requ.httpCodes._400_ClientError._400_BadRequest };
        }
        if (cmd.inTemplates.length === 0) {
            body = undefined;
        }

        try {
            const result = await cmd.run({template, body, header, linkVar, query, files});
            if (result.hasOwnProperty("resFile")) {
                readFileSync((result as any).resFile, "utf-8");
                return result;
            }
            if ((cmd.outTemplates.length === 0 && ((result as any).resBody === undefined || typeof (result as any).resBody === "string")) || (cmd.outTemplates.length !== 0 && json.IsRespectOneTemplate((result as any).resBody, cmd.outTemplates, true) !== null)) {
                if (cmd.outTemplates.length !== 0) (result as any).resBody = json.IsRespectOneTemplate((result as any).resBody, cmd.outTemplates, true) as json.type;
                return result;
            }
            debug.logErr("Internal server error due to bad response template in " + cmd.link + " command");
            return { resBody: "Internal server error", resCode: requ.httpCodes._500_ServerError._500_InternalServerError };
        } catch (err) {
            debug.logErr("Internal server error due to promise rejection in " + cmd.link + " command");
            debug.logErr(`${colors.fg.yellow}The error is : ${colors.fg.red}${err}`)
            return { resBody: "Internal server error", resCode: requ.httpCodes._500_ServerError._500_InternalServerError };
        }
    }
}