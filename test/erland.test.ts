import { describe, expect, test } from 'vitest';
import { PlaygroundManager } from '../src';

const TEST_TIMEOUT = 12 * 1000;

describe('Erlang playground', async () => {
  const manager = new PlaygroundManager('ws://localhost:8080/');
  await manager.connect();

  test(
    'Create a playground',
    async () => {
      await manager.create({
        name: 'erlang_example',
        language: 'erlang',
        callback: (response) => expect(response.type).toBe('ok'),
      });
    },
    TEST_TIMEOUT
  );

  test(
    'Update playground content',
    async () => {
      const content = 'main(_Args) -> io:format("WoW!~n").';
      await manager.update({
        name: 'erlang_example',
        content,
        callback: (response) => expect(response.type).toBe('ok'),
      });
    },
    TEST_TIMEOUT
  );

  test(
    'Run playground content',
    async () => {
      await manager.run({
        name: 'erlang_example',
        callback: (response) => {
          if (response.type == 'data') {
            if (!response.data?.startsWith('===>')) {
              expect(response.data).toBe('WoW!');
            }
          } else {
            expect(response.type).toBe('ok');
          }
        },
      });
    },
    TEST_TIMEOUT
  );

  test(
    'Remove playground',
    async () => {
      await manager.remove({
        name: 'erlang_example',
        callback: (response) => expect(response.type).toBe('ok'),
      });
    },
    TEST_TIMEOUT
  );
});

describe.todo('Elixir playground');
