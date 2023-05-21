import { WebSocket } from 'ws';
import { setTimeout } from 'node:timers/promises';
import type {
  MessageHandler,
  PlaygroundResponse,
  PlaygroundRequest,
} from './types';

export class PlaygroundManager {
  private _websocket: WebSocket;
  private _pool: Map<string, MessageHandler>;

  constructor(url: string) {
    this._websocket = new WebSocket(url);
    this._pool = new Map();

    this._websocket.onmessage = async ({ data }) => {
      const response: PlaygroundResponse = JSON.parse(data.toString());
      this._pool.get(response.id)(response);

      if (response.type != 'data') {
        this._pool.delete(response.id);
      }
    };
  }

  /**
   * Wait until connection is ready to use.
   */
  public async wait() {
    while (this._websocket.readyState !== 1) {
      await setTimeout(100);
    }
  }

  /**
   * Create a new playground.
   *
   * @param name - Name of the playground
   * @param language - Playground language
   * @param callback - Callback for response
   */
  public create(
    name: string,
    env: 'erlang' | 'elixir',
    callback: MessageHandler
  ) {
    const id = generate();
    const packet: PlaygroundRequest = {
      id,
      message: {
        create: {
          name,
          env,
        },
      },
    };

    this._pool.set(id, callback);
    this._websocket.send(JSON.stringify(packet));
  }

  /**
   * Update (set) playground.
   *
   * @param name - Name of the playground
   * @param content - Playground file content
   * @param deps - Dependencies as `name: version`
   * @param callback - Callback for response
   */
  public update(
    name: string,
    content: string,
    dependencies: Record<string, string>,
    callback: MessageHandler
  ) {
    const id = generate();
    const packet: PlaygroundRequest = {
      id,
      message: {
        update: {
          name,
          dependencies,
          content,
        },
      },
    };

    this._pool.set(id, callback)
    this._websocket.send(JSON.stringify(packet));
  }

  /**
   * Run playground.
   *
   * @param name - Name of the playground
   * @param callback - Callback for response
   */
  public run(name: string, callback: MessageHandler) {
    const id = generate();
    const packet: PlaygroundRequest = {
      id,
      message: {
        run: name,
      },
    };

    this._pool.set(id, callback);
    this._websocket.send(JSON.stringify(packet));
  }

  /**
   * Remove playground.
   *
   * @param name - Name of the playground
   * @param callback - Callback for response
   */
  public remove(name: string, callback: MessageHandler) {
    const id = generate();
    const packet: PlaygroundRequest = {
      id,
      message: {
        remove: name,
      },
    };

    this._pool.set(id, callback);
    this._websocket.send(JSON.stringify(packet));
  }

  /**
   * Close connection and reset ID pool.
   */
  public close() {
    this._websocket.close();
    this._pool.clear();
  }
}

function generate(): string {
  return Array(12)
    .fill(0)
    .map((_) => {
      return Math.ceil(Math.random() * 35).toString(36);
    })
    .join('');
}
