import { requ } from "@gscript/grequest";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { GRequest } from "../GRequest";
import { createWriteStream, existsSync, readFileSync, writeFileSync } from "fs";
import { json, typeExt } from "@gscript/gtools";

const file = __dirname + '/call.json'

class Call extends GRequest {
    private static waitTime: json.objPersoType<number> = {'*': 0}
    private static lastCall: json.objPersoType<json.objPersoType<json.objPersoType<json.objPersoType<number>>>> = {}
    private static fileExists: boolean = false

    static callWaitTime(domain: string | '*', ms: number) {
        Call.checkIfJsonExists()
        Call.waitTime[domain] = (ms < 0 ? (domain === '*' ? 0 : undefined) as any : ms)
    }

    static async call(type: requ.callType, url: string, config?: AxiosRequestConfig<any> | undefined): Promise<requ.responseContent> {
        Call.checkIfJsonExists()

        const domain = url.split('://')[url.split('://').length - 1].split('/')[0]
        const requestParams = url.split(domain)[url.split(domain).length - 1]
        const content = json.stringify(config as json.type);
        
        if (!Call.lastCall[domain]) Call.lastCall[domain] = {}
        if (!Call.lastCall[domain][type]) Call.lastCall[domain][type] = {}
        if (!Call.lastCall[domain][type][requestParams]) Call.lastCall[domain][type][requestParams] = {}

        const now = Date.now()
        const last = Call.lastCall[domain][type][requestParams][content] || 0

        if (last !== 0 && now - last < (Call.waitTime[domain] !== undefined ? Call.waitTime[domain] : Call.waitTime['*'])) {
            return (json.parse(readFileSync(file, 'utf8')) as unknown as json.objPersoType<json.objPersoType<json.objPersoType<json.objPersoType<requ.responseContent>>>>)[domain][type][requestParams][content]
        }
        
        Call.lastCall[domain][type][requestParams][content] = now
        return await Call.forceCall(type, url, config)
    }

    static async forceCall(type: requ.callType, url: string, config?: AxiosRequestConfig<any> | undefined): Promise<requ.responseContent> {
        const now = Date.now()
        const res = await axios[type](url, config)
        
        const domain = url.split('://')[url.split('://').length - 1].split('/')[0]
        const requestParams = url.split(domain)[url.split(domain).length - 1]
        const content = json.stringify(config as json.type);
        
        if (!Call.lastCall[domain]) Call.lastCall[domain] = {}
        if (!Call.lastCall[domain][type]) Call.lastCall[domain][type] = {}
        if (!Call.lastCall[domain][type][requestParams]) Call.lastCall[domain][type][requestParams] = {}
        Call.lastCall[domain][type][requestParams][content] = now

        Call.checkIfJsonExists()

        var fileContent = json.parse(readFileSync(file, 'utf8')) as unknown as json.objPersoType<json.objPersoType<json.objPersoType<json.objPersoType<requ.responseContent>>>>
        if (fileContent === undefined) fileContent = {}
        if (!fileContent[domain]) fileContent[domain] = {}
        if (!fileContent[domain][type]) fileContent[domain][type] = {}
        if (!fileContent[domain][type][requestParams]) fileContent[domain][type][requestParams] = {}
        var res2 : requ.responseContent = {
            link: res.request.res.responseUrl,
            status: res.status,
            header: res.headers as json.objPersoType<string>,
            body: res.data
        }
        fileContent[domain][type][requestParams][content] = res2
        writeFileSync(file, json.stringify(fileContent as unknown as json.type))
        
        return res2
    }

    private static checkIfJsonExists() {
        if (Call.fileExists || existsSync(file)) {
            Call.fileExists = true
            return
        }
        const stream = createWriteStream(file)
        stream.end()
    }
}

export const call = Call.call
export const forceCall = Call.forceCall
export const callWaitTime = Call.callWaitTime