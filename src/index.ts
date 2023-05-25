import { WebSocket } from 'ws';
import { setTimeout } from 'node:timers/promises';
import type {
  MessageHandler,
  PlaygroundResponse,
  PlaygroundManagerOptions,
  PlaygroundEvents,
  PlaygroundMessage,
  PlaygroundPacket,
} from './types';

export class PlaygroundManager {
  private _url: string;
  private _options: PlaygroundManagerOptions;
  private _websocket: WebSocket;
  private _pool: Map<string, MessageHandler>;

  constructor(
    url: string,
    options: PlaygroundManagerOptions = { loopInterval: 200 }
  ) {
    this._url = url;
    this._options = options;
    this._websocket = null;
    this._pool = new Map();
  }

  /**
   * Connect to the playground.
   * @param url - URL of the playground. Defaults to the URL entered into {@link PlaygroundManager}
   */
  public async connect(url = this._url) {
    this._websocket = new WebSocket(url);
    this._websocket.addEventListener("message", async ({ data }) => {
      const response: PlaygroundResponse = JSON.parse(data.toString());

      this._pool.get(response.id)(response);
      if (response.type !== 'data') {
        this._pool.delete(response.id)
      }
    })

    while (this._websocket.readyState !== 1) {
      await setTimeout(this._options.loopInterval);
    }
  }

  /**
   * Create a new playground.
   *
   * @param name - Name of the playground
   * @param language - Playground language
   * @param callback - Callback for response
   * @returns When all callbacks are executed
   */
  public async create(
    name: string,
    env: 'erlang' | 'elixir',
    callback: MessageHandler
  ) {
    const packet = this._createPacket('create', generateId(), {
      env,
      name,
    });
    return await this._sendPacket(packet, callback);
  }

  /**
   * Update (set) playground.
   *
   * @param name - Name of the playground
   * @param content - Playground file content
   * @param deps - Dependencies as `name: version`
   * @param callback - Callback for response
   * @returns When all callbacks are executed
   */
  public async update(
    name: string,
    content: string,
    dependencies: Record<string, string>,
    callback: MessageHandler
  ) {
    const packet = this._createPacket('update', generateId(), {
      name,
      dependencies,
      content,
    });
    return await this._sendPacket(packet, callback);
  }

  /**
   * Run playground.
   *
   * @param name - Name of the playground
   * @param callback - Callback for response
   * @returns When all callbacks are executed
   */
  public async run(name: string, callback: MessageHandler) {
    const packet = this._createPacket('run', generateId(), name);
    return await this._sendPacket(packet, callback);
  }

  /**
   * Remove playground.
   *
   * @param name - Name of the playground
   * @param callback - Callback for response
   * @returns When all callbacks are executed
   */
  public async remove(name: string, callback: MessageHandler) {
    const packet = this._createPacket('remove', generateId(), name);
    return await this._sendPacket(packet, callback);
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
   * @param event - {@link PlaygroundEvents}
   * @param callbackId - Callback id
   * @param payload - {@link PlaygroundPacket}
   * @returns Generated packet
   */
  private _createPacket<T extends PlaygroundEvents>(
    event: T,
    callbackId: string,
    payload: PlaygroundMessage<T>
  ): PlaygroundPacket<T> {
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

function generateId(): string {
  return Array(12)
    .fill(0)
    .map(() => Math.ceil(Math.random() * 35).toString(36))
    .join('');
}
