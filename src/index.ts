import { requ } from './export'
import { Request } from './base/reqClass'
import { reqManager } from './base'
import { Request as request, Response as response } from 'express'
import { SocketIO, sockets } from './socket.io'
import { call, forceCall, callWaitTime } from './call'
import ical from './ical'

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
    SocketIO,
    sockets,
    req,
    res,
    callWaitTime,
    call,
    forceCall,
    ical
}