import { describe, expect, test } from 'vitest';
import { PlaygroundManager } from '../src';

const TEST_TIMEOUT = 12 * 1000;

describe('Erlang playground', async () => {
  const manager = new PlaygroundManager('ws://localhost:8080/');
  await manager.connect();

  test(
    'Create a playground',
    async () => {
      await manager.create('erlang_example', 'erlang', (response) => {
        expect(response.type).toBe('ok');
      });
    },
    TEST_TIMEOUT
  );

  test(
    'Update playground content',
    async () => {
      const content = 'main(_Args) -> io:format("WoW!~n").';
      await manager.update('erlang_example', content, {}, (response) => {
        expect(response.type).toBe('ok');
      });
    },
    TEST_TIMEOUT
  );

  test(
    'Run playground content',
    async () => {
      await manager.run('erlang_example', (response) => {
        if (response.type == 'data') {
          if (!response.data?.startsWith('===>')) {
            expect(response.data).toBe('WoW!');
          }
        } else {
          expect(response.type).toBe('ok');
        }
      });
    },
    TEST_TIMEOUT
  );

  test(
    'Remove playground',
    async () => {
      await manager.remove('erlang_example', (response) => {
        expect(response.type).toBe('ok');
      });
    },
    TEST_TIMEOUT
  );
});

describe.todo('Elixir playground');
