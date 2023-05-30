import { PlaygroundManager } from '.';

/**
 * Options for {@link PlaygroundManager}.
 */
export type PlaygroundManagerOptions = {
  /**
   * Loop interval for {@link PlaygroundManager.create}, {@link PlaygroundManager.update}, {@link PlaygroundManager.run} and {@link PlaygroundManager.remove}.
   */
  loopInterval: number;
};

/**
 * Message handler function.
 */
export type MessageHandler = (
  response: PlaygroundResponse
) => void | Promise<void>;

/**
 * Type for message request.
 */
export interface PlaygroundPacket<T extends PlaygroundEvents> {
  id: string;
  message: {
    [E in T]: PlaygroundMessage<T>;
  };
}

/**
 * Playground class functions.
 */
export type PlaygroundEvents = 'create' | 'update' | 'run' | 'remove';

/**
 * Union type to combine all playground request messages.
 */
export type PlaygroundMessage<T extends PlaygroundEvents> = T extends 'create'
  ? PlaygroundCreateMessage
  : T extends 'update'
  ? PlaygroundUpdateMessage
  : T extends 'run'
  ? PlaygroundRunMessage
  : T extends 'remove'
  ? PlaygroundRemoveMessage
  : never;

/**
 * Playground languages.
 */
export type PlaygroundEnvironments = 'erlang' | 'elixir';

/**
 * Create message type for playground.
 */
export type PlaygroundCreateMessage = {
  name: string;
  env: PlaygroundEnvironments;
};

/**
 * Update message type for playground.
 */
export type PlaygroundUpdateMessage = {
  name: string;
  content: string;
  dependencies: Record<string, string>;
};

/**
 * Run message type for playground.
 */
export type PlaygroundRunMessage = string;

/**
 * Remove message type for playground.
 */
export type PlaygroundRemoveMessage = string;

/**
 * Response type for playground.
 */
export interface PlaygroundResponse {
  id: string;
  type: 'ok' | 'error' | 'data';
  data?: string;
}
