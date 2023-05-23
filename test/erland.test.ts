import { describe, expect, test } from 'vitest';
import { PlaygroundManager } from '../src';

describe('Erlang playground', async () => {
  const manager = new PlaygroundManager('ws://localhost:8080/');
  await manager.wait();

  test(
    'Create a playground',
    async () => {
      await manager.create('erlang_example', 'erlang', (response) => {
        expect(response.type).toBe('ok');
      });
    },
    { retry: 3 }
  );

  test(
    'Update playground content',
    async () => {
      const content = 'main(_Args) -> io:format("WoW!~n").';
      await manager.update('erlang_example', content, {}, (response) => {
        expect(response.type).toBe('ok');
      });
    },
    { retry: 3 }
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
    { retry: 3 }
  );

  test(
    'Remove playground',
    async () => {
      await manager.remove('erlang_example', (response) => {
        expect(response.type).toBe('ok');
      });
    },
    { retry: 3 }
  );
});

describe.todo('Elixir playground');
