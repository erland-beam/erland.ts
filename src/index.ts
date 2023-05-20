import { WebSocket } from 'ws';
import type {
  MessageHandler,
  PlaygroundResponse,
  PlaygroundRequest,
} from './types';

export class PlaygroundManager {
  private _websocket: WebSocket;
  private _pool: Record<string, MessageHandler>;

  constructor(url: string) {
    this._websocket = new WebSocket(url);
    this._pool = {};

    this._websocket.onmessage = async ({ data }) => {
      const response: PlaygroundResponse = JSON.parse(data.toString());
      this._pool[response.id](response);

      if (response.type != 'data') {
        delete this._pool[response.id];
      }
    };
  }

  /**
   * Wait until connection is ready to use.
   */
  public async wait() {
    while (this._websocket.readyState !== 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
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

    this._pool[id] = callback;
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

    this._pool[id] = callback;
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

    this._pool[id] = callback;
    this._websocket.send(JSON.stringify(packet));
  }

  /**
   * Delete playground.
   *
   * @param name - Name of the playground
   * @param callback - Callback for response
   */
  public delete(name: string, callback: MessageHandler) {
    const id = generate();
    const packet: PlaygroundRequest = {
      id,
      message: {
        remove: name,
      },
    };

    this._pool[id] = callback;
    this._websocket.send(JSON.stringify(packet));
  }

  /**
   * Close connection and reset ID pool.
   */
  public close() {
    this._websocket.close();
    this._pool = {};
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
