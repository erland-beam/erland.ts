import { WebSocket } from 'ws';
import { setTimeout } from 'node:timers/promises';
import type {
  MessageHandler,
  PlaygroundResponse,
  PlaygroundRequest,
  PlaygroundManagerOptions,
} from './types';

export class PlaygroundManager {
  private _options: PlaygroundManagerOptions;
  private _websocket: WebSocket;
  private _pool: Map<string, MessageHandler>;

  constructor(
    url: string,
    options: PlaygroundManagerOptions = { loopInterval: 200 }
  ) {
    this._options = options;
    this._websocket = new WebSocket(url);
    this._pool = new Map();

    this._websocket.onmessage = async ({ data }) => {
      const response: PlaygroundResponse = JSON.parse(data.toString());

      this._pool.get(response.id)(response);
      if (response.type !== 'data') {
        this._pool.delete(response.id);
      }
    };
  }

  /**
   * Wait until connection is ready to use.
   */
  public async wait() {
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
    const callbackId = generateId();
    const packet: PlaygroundRequest = {
      id: callbackId,
      message: {
        create: {
          name,
          env,
        },
      },
    };

    this._pool.set(callbackId, callback);
    this._websocket.send(JSON.stringify(packet));

    this._websocket.onmessage;

    while (this._pool.get(callbackId)) {
      await setTimeout(this._options.loopInterval);
    }
    return Promise.resolve(true);
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
    const callbackId = generateId();
    const packet: PlaygroundRequest = {
      id: callbackId,
      message: {
        update: {
          name,
          dependencies,
          content,
        },
      },
    };

    this._pool.set(callbackId, callback);
    this._websocket.send(JSON.stringify(packet));

    while (this._pool.get(callbackId)) {
      await setTimeout(this._options.loopInterval);
    }
    return Promise.resolve(true);
  }

  /**
   * Run playground.
   *
   * @param name - Name of the playground
   * @param callback - Callback for response
   * @returns When all callbacks are executed
   */
  public async run(name: string, callback: MessageHandler) {
    const callbackId = generateId();
    const packet: PlaygroundRequest = {
      id: callbackId,
      message: {
        run: name,
      },
    };

    this._pool.set(callbackId, callback);
    this._websocket.send(JSON.stringify(packet));

    while (this._pool.get(callbackId)) {
      await setTimeout(this._options.loopInterval);
    }
    return Promise.resolve(true);
  }

  /**
   * Remove playground.
   *
   * @param name - Name of the playground
   * @param callback - Callback for response
   * @returns When all callbacks are executed
   */
  public async remove(name: string, callback: MessageHandler) {
    const callbackId = generateId();
    const packet: PlaygroundRequest = {
      id: callbackId,
      message: {
        remove: name,
      },
    };

    this._pool.set(callbackId, callback);
    this._websocket.send(JSON.stringify(packet));

    while (this._pool.get(callbackId)) {
      await setTimeout(this._options.loopInterval);
    }
    return Promise.resolve(true);
  }

  /**
   * Close connection and reset ID pool.
   */
  public close() {
    this._websocket.close();
    this._pool.clear();
  }
}

function generateId(): string {
  return Array(12)
    .fill(0)
    .map(() => Math.ceil(Math.random() * 35).toString(36))
    .join('');
}
