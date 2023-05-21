import { PlaygroundManager } from ".";

/**
 * Options for {@link PlaygroundManager}.
 */
export type PlaygroundManagerOptions = {
  /**
   * Loop interval for {@link PlaygroundManager.create}, {@link PlaygroundManager.update}, {@link PlaygroundManager.run} and {@link PlaygroundManager.remove}.
   */
  loopInterval: number
}

/**
 * Message handler function.
 */
export type MessageHandler = (
  response: PlaygroundResponse
) => void | Promise<void>;

/**
 * Type for message request.
 */
export interface PlaygroundRequest {
  id: String;
  message: PlaygroundMessage;
}

/**
 * Union type to combine all playground request messages.
 */
export type PlaygroundMessage =
  | PlaygroundCreateMessage
  | PlaygroundUpdateMessage
  | PlaygroundRunMessage
  | PlaygroundRemoveMessage;

/**
 * Create message type for playground.
 */
export type PlaygroundCreateMessage = {
  create: {
    name: string;
    env: 'erlang' | 'elixir';
  };
};

/**
 * Update message type for playground.
 */
export type PlaygroundUpdateMessage = {
  update: {
    name: string;
    content: string;
    dependencies: Record<string, string>;
  };
};

/**
 * Run message type for playground.
 */
export type PlaygroundRunMessage = { run: string };

/**
 * Remove message type for playground.
 */
export type PlaygroundRemoveMessage = { remove: string };

/**
 * Response type for playground.
 */
export interface PlaygroundResponse {
  id: string;
  type: 'ok' | 'error' | 'data';
  data?: string;
}
