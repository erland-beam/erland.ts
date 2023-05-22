import { describe, expect, test } from 'vitest';
import { PlaygroundManager } from '../src';

describe('Erlang playground', async () => {
  const manager = new PlaygroundManager('ws://localhost:8080/');
  await manager.wait();

  // Create playground
  test('Create', async () => {
    await manager.create('erlang_example', 'erlang', (response) => {
      expect(response.type).toBe('ok');
    });
  });

  // Update playground content
  test('Update', async () => {
    const content = 'main(_Args) -> io:format("WoW!~n").';
    await manager.update('erlang_example', content, {}, (response) => {
      expect(response.type).toBe('ok');
    });
  });

  // Run playground
  test('Run', async () => {
    await manager.run('erlang_example', (response) => {
      if (response.type == 'data') {
        if (!response.data?.startsWith('===>')) {
          expect(response.data).toBe('WoW!');
        }
      } else {
        expect(response.type).toBe('ok');
      }
    });
  });

  // Remove playground
  test('Remove', async () => {
    await manager.remove('erlang_example', (response) => {
      expect(response.type).toBe('ok');
    });
  });
});

describe.todo('Elixir playground');
