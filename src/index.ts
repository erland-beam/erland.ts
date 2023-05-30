import { WebSocket } from 'ws';
import { setTimeout } from 'node:timers/promises';
import type {
  MessageHandler,
  PlaygroundEnvironments,
  PlaygroundResponse,
  PlaygroundManagerOptions,
  PlaygroundEvents,
  PlaygroundMessage,
  PlaygroundPacket,
} from './types';

export class PlaygroundManager {
  private _url: string | URL;
  private _options: PlaygroundManagerOptions;
  private _websocket: WebSocket;
  private _pool: Map<string, MessageHandler>;

  constructor(
    url: string | URL,
    options: PlaygroundManagerOptions = { loopInterval: 200 }
  ) {
    this._url = url;
    this._options = options;
    this._websocket = null;
    this._pool = new Map();
  }

  /**
   * Create a new playground.
   *
   * @param params - {@link PlaygroundCreateParams}
   * @returns When all callbacks are executed
   */
  public async create(params: PlaygroundCreateParams) {
    const { name, env, callback } = params;

    const packet = this._createPacket({
      event: 'create',
      callbackId: generateId(),
      payload: {
        name,
        env,
      },
    });
    return await this._sendPacket(packet, callback);
  }

  /**
   * Update (set) playground.
   *
   * @param params - {@link PlaygroundUpdateParams}
   * @returns When all callbacks are executed
   */
  public async update(params: PlaygroundUpdateParams) {
    const { name, content, dependencies, callback } = params;

    const packet = this._createPacket({
      event: 'update',
      callbackId: generateId(),
      payload: {
        name,
        content,
        dependencies,
      },
    });
    return await this._sendPacket(packet, callback);
  }

  /**
   * Run playground.
   *
   * @param params - {@link PlaygroundRunParams}
   * @returns When all callbacks are executed
   */
  public async run(params: PlaygroundRunParams) {
    const { name, callback } = params;

    const packet = this._createPacket({
      event: 'run',
      callbackId: generateId(),
      payload: name,
    });
    return await this._sendPacket(packet, callback);
  }

  /**
   * Remove playground.
   *
   * @param params {@link PlaygroundRemoveParams}
   * @returns When all callbacks are executed
   */
  public async remove(params: PlaygroundRemoveParams) {
    const { name, callback } = params;

    const packet = this._createPacket({
      event: 'remove',
      callbackId: generateId(),
      payload: name,
    });
    return await this._sendPacket(packet, callback);
  }

  /**
   * Connect to the playground.
   * @param url - URL of the playground. Defaults to the URL entered into {@link PlaygroundManager}
   */
  public async connect(url = this._url) {
    this._websocket = new WebSocket(url);
    this._websocket.addEventListener('message', async ({ data }) => {
      const response: PlaygroundResponse = JSON.parse(data.toString());

      this._pool.get(response.id)(response);
      if (response.type !== 'data') {
        this._pool.delete(response.id);
      }
    });

    while (this._websocket.readyState !== 1) {
      await setTimeout(this._options.loopInterval);
    }
  }

  /**
   * Close connection and reset ID pool.
   */
  public close() {
    this._websocket.close();
    this._pool.clear();
  }

  /**
   * Generate a packet JSON.
   * @param packetData.event - {@link PlaygroundEvents}
   * @param packetData.callbackId - Callback id
   * @param packetData.payload - {@link PlaygroundPacket}
   * @returns Generated packet
   */
  private _createPacket<T extends PlaygroundEvents>(packetData: {
    event: T;
    callbackId: string;
    payload: PlaygroundMessage<T>;
  }): PlaygroundPacket<T> {
    const { event, callbackId, payload } = packetData;
    return {
      id: callbackId,
      message: { [event]: payload } as { [E in T]: PlaygroundMessage<T> },
    };
  }

  /**
   * Send packet to the playground.
   * @param packet - {@link PlaygroundPacket}
   * @param callback - Callback for response
   * @returns When all callbacks are executed
   */
  private async _sendPacket<T extends PlaygroundEvents>(
    packet: PlaygroundPacket<T>,
    callback: MessageHandler
  ) {
    this._pool.set(packet.id, callback);
    this._websocket.send(JSON.stringify(packet));

    while (this._pool.get(packet.id)) {
      await setTimeout(this._options.loopInterval);
    }

    return Promise.resolve(true);
  }
}

interface PlaygroundCreateParams {
  /**
   * Name of the playground
   */
  name: string;
  /**
   * Playground language
   */
  env: PlaygroundEnvironments;
  /**
   * Callback for response
   */
  callback: MessageHandler;
}

interface PlaygroundUpdateParams {
  /**
   * Name of the playground
   */
  name: string;
  /**
   * Playground file content
   */
  content: string;
  /**
   * Dependencies as `name: version`
   */
  dependencies?: Record<string, string>;
  /**
   * Callback for response
   */
  callback: MessageHandler;
}

interface PlaygroundRunParams {
  /**
   * Name of the playground
   */
  name: string;
  /**
   * Callback for response
   */
  callback: MessageHandler;
}

interface PlaygroundRemoveParams {
  /**
   * Name of the playground
   */
  name: string;
  /**
   * Callback for response
   */
  callback: MessageHandler;
}

function generateId(): string {
  return Array(12)
    .fill(0)
    .map(() => Math.ceil(Math.random() * 35).toString(36))
    .join('');
}
