import { describe, expect, test } from 'vitest';
import { PlaygroundManager } from '../dist';
import { setTimeout } from 'node:timers/promises';

describe('Erlang playground', async () => {
  const manager = new PlaygroundManager('ws://localhost:8080/');
  await manager.wait();

  // Create playground
  test('Create', async () => {
    manager.create('erl_test', 'erlang', (response) => {
      expect(response.type).toBe('ok');
    });

    await setTimeout(3000);
  }, 3000);

  // Update playground content
  test('Update', async () => {
    const content = 'main(_Args) ->\n  io:format("WoW!~n").';

    manager.update('erl_test', content, {}, (response) => {
      expect(response.type).toBe('ok');
    });

    await setTimeout(1000);
  }, 1000);

  // Run playground
  test('Run', async () => {
    manager.run('erl_test', (response) => {
      if (response.type == 'data') {
        if (!response.data?.startsWith('===>')) {
          expect(response.data).toBe('WoW!');
        }
      } else {
        expect(response.type).toBe('ok');
      }
    });

    await setTimeout(5000);
  }, 5000);

  // Remove playground
  test('Remove', async () => {
    manager.remove('erl_test', (response) => {
      expect(response.type).toBe('ok');
    });

    await setTimeout(1000);
  }, 1000);
});

describe.todo('Elixir playground');
