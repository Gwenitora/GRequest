import { Server, Socket } from 'socket.io';
import { GRequest } from '../GRequest';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { json } from '@gscript/gtools';

export type sockets = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

/**
 * Class SocketIO for send datas to the clients, or to create funnel between clients
 */
export class SocketIO extends GRequest {
    private static io: Server;
    private static connection: ((socket: sockets) => void)[] = [];
    private static disconnection: ((socket: sockets) => void)[] = [];
    private static started: boolean = false;
    private static allSockets: sockets[];
    private static channels: json.objPersoType<sockets[]> = {};

    /**
     * Initialize the SocketIO server
     * 
     * @returns The SocketIO server to chain the methods
     */
    public static init() : typeof SocketIO {
        if (SocketIO.started) return SocketIO;
        SocketIO.io = new Server();
        return SocketIO
    }

    /**
     * Start the sockets readers
     * 
     * @returns The SocketIO server to chain the methods
     */
    public static start(): typeof SocketIO {
        if (SocketIO.started) return SocketIO;
        SocketIO.started = true;
        SocketIO.io.listen(3000);
        SocketIO.io.on('connection', SocketIO.connections);
        return SocketIO
    }

    /**
     * Add a function to the connection list
     * 
     * @param func The function to add to the connection list
     * @returns The SocketIO server to chain the methods
     */
    public static addConnectionFunction(func: (socket: sockets) => void): typeof SocketIO {
        SocketIO.connection.push(func);
        return SocketIO;
    }

    /**
     * Add a function to the disconnection list
     * 
     * @param func The function to add to the disconnection list
     * @returns The SocketIO server to chain the methods
     */
    public static addDisconnectionFunction(func: (socket: sockets) => void): typeof SocketIO {
        SocketIO.disconnection.push(func);
        return SocketIO;
    }

    /**
     * Create or join a channel to all funnels messages
     * 
     * @param socket The socket to add to the channel
     * @param channel The channel to create or join
     * @returns The SocketIO server to chain the methods
     */
    public static createOrJoinChannel(socket: sockets, channel: string) : typeof SocketIO {
        if (!SocketIO.channels[channel]) {
            SocketIO.channels[channel] = [];
        }
        SocketIO.sendToChannel(channel, 'info', 'joinU', 'A new user has joined the channel ' + channel + ': ' + socket.id);
        SocketIO.channels[channel].push(socket);
        SocketIO.sendToSocket(socket, 'info', 'join', 'You have joined a channel: ' + channel + '\nall already connected users: ' + SocketIO.channels[channel].map((s) => s.id).join(', '));
        return SocketIO;
    }

    /**
     * Quit a channel
     * 
     * @param socket The socket to remove from the channel
     * @param channel The channel to quit (if not specified, quit all channels)
     * @returns The SocketIO server to chain the methods
     */
    public static quitChannel(socket: sockets, channel?: string) : typeof SocketIO {
        if (!channel) {
            for (let key in SocketIO.channels) {
                SocketIO.quitChannel(socket, key);
            }
            return SocketIO;
        }
        if (SocketIO.channels[channel]) {
            if (SocketIO.channels[channel].includes(socket)) {
                SocketIO.sendToSocket(socket, 'info', 'left', 'You have left a channel: ' + channel);
                SocketIO.channels[channel] = SocketIO.channels[channel].filter((s) => s !== socket);
                SocketIO.sendToChannel(channel, 'info', 'leftU', 'A user has left the channel ' + channel + ': ' + socket.id);
            }

            if (SocketIO.channels[channel].length === 0) {
                SocketIO.destroyChannel(channel);
            }
        }
        return SocketIO;
    }

    /**
     * Destroy a channel
     * 
     * @param channel The channel to destroy
     * @returns The SocketIO server to chain the methods
     */
    public static destroyChannel(channel: string) : typeof SocketIO {
        if (SocketIO.channels[channel]) {
            if (SocketIO.channels[channel].length !== 0) {
                SocketIO.sendToChannel(channel, 'info', 'destroyChan', 'The channel ' + channel + ' has been destroyed');
                for (let i = 0; i < SocketIO.channels[channel].length; i++) {
                    SocketIO.quitChannel(SocketIO.channels[channel][i], channel);
                }
                return SocketIO;
            }
            delete SocketIO.channels[channel];
        }
        return SocketIO;
    }

    /**
     * Send a message to a channel
     * 
     * @param channel The channel to send the message
     * @param id The id of the event message
     * @param args Datas to send
     * @returns The SocketIO server to chain the methods
     */
    public static sendToChannel(channel: string, id: string, ...args: json.type[]) : typeof SocketIO {
        if (!SocketIO.channels[channel] || args.length === 0) {
            return SocketIO;
        }
        for (let i = 0; i < SocketIO.channels[channel].length; i++) {
            SocketIO.channels[channel][i].emit(id, ...args);
        }
        return SocketIO;
    }

    /**
     * Send a message to all clients
     * 
     * @param id The id of the event message
     * @param args Datas to send
     * @returns The SocketIO server to chain the methods
     */
    public static sendToAll(id: string, ...args: json.type[]) : typeof SocketIO {
        if (args.length === 0) {
            return SocketIO;
        }
        for (let i = 0; i < SocketIO.allSockets.length; i++) {
            SocketIO.allSockets[i].emit(id, ...args);
        }
        return SocketIO;
    }

    /**
     * Send a message to a specific socket
     * 
     * @param socket The socket to send the message
     * @param id The id of the event message
     * @param args Datas to send
     * @returns The SocketIO server to chain the methods
     */
    public static sendToSocket(socket: sockets, id: string, ...args: json.type[]) : typeof SocketIO {
        if (args.length === 0) {
            return SocketIO;
        }
        socket.emit(id, ...args);
        return SocketIO;
    }

    /**
     * Get all channels of a socket
     * 
     * @param socket The socket to get the channels
     * @returns The list of channels
     */
    public static getChannelsOfSocket(socket: sockets) : string[] {
        let channels: string[] = [];
        for (let key in SocketIO.channels) {
            if (SocketIO.channels[key].includes(socket)) {
                channels.push(key);
            }
        }
        return channels;
    }

    /**
     * Get a socket with an id of socket
     * 
     * @param id The id of the socket
     * @returns The socket with the id choosen, or null if not found
     */
    public static getSocketWithId(id: string) : sockets | null {
        var sockets = SocketIO.allSockets.filter((s) => s.id === id);
        if (sockets.length === 1) return sockets[0];
        return null;
    }

    private static connections(socket: sockets) {
        SocketIO.connection.forEach((func) => {
            func(socket);
        });
        socket.on('disconnect', () => {
            SocketIO.disconnections(socket);
        });
        socket.onAny((id, ...args) => {
            const chans = SocketIO.getChannelsOfSocket(socket);
            if (chans.length === 0) return;
            for (let i = 0; i < chans.length; i++) {
                SocketIO.sendToChannel(chans[i], id, ...args);
            }
        });
        SocketIO.allSockets.push(socket);
    }

    private static disconnections(socket: sockets) {
        SocketIO.disconnection.forEach((func) => {
            func(socket);
        });
        SocketIO.quitChannel(socket);
        SocketIO.allSockets = SocketIO.allSockets.filter((s) => s !== socket);
    }
}