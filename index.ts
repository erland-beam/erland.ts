type Handler = (data: PlaygroundResponse) => Promise<void> | void;

/**
 * Response type for playground.
 *
 * @remarks
 * `data` will be undefined if `type` is "ok".
 */
export interface PlaygroundResponse {
  type: "ok" | "error" | "data";
  data?: string;
}

/**
 * Playground manager allows you to create, set, run playgrounds.
 */
export class PlaygroundManager {
  private _websocket: WebSocket;
  private _pool: Record<string, Handler>;

  constructor(url: string) {
    this._websocket = new WebSocket(url);
    this._pool = {};

    this._websocket.onmessage = async ({ data }) => {
      const decode = JSON.parse(data);

      switch (decode.type) {
        case 0:
          await this._pool[decode.id]({ type: "ok" });
          break;
        case 1:
          await this._pool[decode.id]({ type: "error", data: decode.data });
          break;
        case 2:
          await this._pool[decode.id]({ type: "data", data: decode.data });
          return;
      }

      delete this._pool[decode.id];
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
    language: "erlang" | "elixir",
    callback: Handler,
  ) {
    const id = generate();
    const packet = JSON.stringify({
      id,
      method: "create",
      params: [language, name],
    });

    this._pool[id] = callback;
    this._websocket.send(packet);
  }

  /**
   * Update (set) playground.
   *
   * @param name - Name of the playground
   * @param deps - Dependencies as `name: version`
   * @param content - Playground file content
   * @param callback - Callback for response
   */
  public update(
    name: string,
    deps: Record<string, string>,
    content: string,
    callback: Handler,
  ) {
    const id = generate();
    const packet = JSON.stringify({
      id,
      method: "set",
      params: [deps, content, name],
    });

    this._pool[id] = callback;
    this._websocket.send(packet);
  }

  /**
   * Run playground.
   *
   * @param name - Name of the playground
   * @param callback - Callback for response
   */
  public run(name: string, callback: Handler) {
    const id = generate();
    const packet = JSON.stringify({
      id,
      method: "run",
      params: [name],
    });

    this._pool[id] = callback;
    this._websocket.send(packet);
  }

  /**
   * Delete playground.
   *
   * @param name - Name of the playground
   * @param callback - Callback for response
   */
  public delete(name: string, callback: Handler) {
    const id = generate();
    const packet = JSON.stringify({
      id,
      method: "delete",
      params: [name],
    });

    this._pool[id] = callback;
    this._websocket.send(packet);
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
    .join("");
}
