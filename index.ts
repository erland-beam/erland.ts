import { v5 } from "https://deno.land/std@0.187.0/uuid/mod.ts";

type Handler = (data?: string) => void;

export class PlaygroundManager {
  websocket: WebSocket;
  pool: Record<string, Handler>;

  constructor(url: string) {
    this.websocket = new WebSocket(url);
    this.pool = {};

    this.websocket.addEventListener("message", ({ data }) => {
      const decode = JSON.parse(data);

      switch (decode.type) {
        case 0:
          this.pool[decode.id]();
          break;
        case 1:
        case 2:
          this.pool[decode.id](decode.data);
          break;
      }

      delete this.pool[decode.id];
    });
  }

  async create(name: string, language: "erlang" | "elixir", callback: Handler) {
    const id = await v5.generate("create", new TextEncoder().encode(name));
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
    callback: Handler
  ) {
    const id = await v5.generate("update", new TextEncoder().encode(name));
    const packet = JSON.stringify({
      id,
      method: "set",
      params: [deps, content, name],
    });

    this.pool[id] = callback;
    this.websocket.send(packet);
  }

  async run(name: string, callback: Handler) {
    const id = await v5.generate("run", new TextEncoder().encode(name));
    const packet = JSON.stringify({
      id,
      method: "run",
      params: [name],
    });

    this.pool[id] = callback;
    this.websocket.send(packet);
  }
}
