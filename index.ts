type Handler = (data: PlaygroundResponse) => Promise<void>;

export interface PlaygroundResponse {
  type: "ok" | "error" | "data";
  data?: string;
}

export class PlaygroundManager {
  websocket: WebSocket;
  pool: Record<string, Handler>;

  constructor(url: string) {
    this.websocket = new WebSocket(url);
    this.pool = {};

    this.websocket.onmessage = async ({ data }) => {
      const decode = JSON.parse(data);

      switch (decode.type) {
        case 0:
          await this.pool[decode.id]({ type: "ok" });
          break;
        case 1:
          await this.pool[decode.id]({ type: "error", data: decode.data });
          break;
        case 2:
          await this.pool[decode.id]({ type: "data", data: decode.data });
          return;
      }

      delete this.pool[decode.id];
    };
  }

  async wait() {
    while (this.websocket.readyState !== 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  async create(name: string, language: "erlang" | "elixir", callback: Handler) {
    const id = await generate();
    const packet = JSON.stringify({
      id,
      method: "create",
      params: [language, name],
    });

    this.pool[id] = callback;
    this.websocket.send(packet);
  }

  async update(
    name: string,
    deps: Record<string, string>,
    content: string,
    callback: Handler,
  ) {
    const id = await generate();
    const packet = JSON.stringify({
      id,
      method: "set",
      params: [deps, content, name],
    });

    this.pool[id] = callback;
    this.websocket.send(packet);
  }

  async run(name: string, callback: Handler) {
    const id = await generate();
    const packet = JSON.stringify({
      id,
      method: "run",
      params: [name],
    });

    this.pool[id] = callback;
    this.websocket.send(packet);
  }

  close() {
    this.websocket.close();
    this.pool = {};
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
