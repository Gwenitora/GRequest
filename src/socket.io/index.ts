import { reqManager } from '@gscript/grequest';
import { Server } from 'socket.io';
import { GRequest } from '../GRequest';
import { createServer } from 'http';

/**
 * Class SocketIO for send datas to the clients, or to create funnel between clients
 */
class SocketIO extends GRequest {
    private static io: Server;

    /**
     * Initialize the SocketIO server
     */
    public static init() {
        // this.io = new Server(reqManager.app);
    }
}