import { requ } from './export'
import { Request } from './base/reqClass'
import { reqManager } from './base/manager'
import { Request as request, Response as response } from 'express'

/**
 * The type of a request by `express`.
 * Not very important for you, but it's here if you want.
 */
type req = request;
/**
 * The type of a response by `express`.
 * Not very important for you, but it's here if you want.
 */
type res = response;

export {
    requ,
    reqManager,
    Request,
    req,
    res
}