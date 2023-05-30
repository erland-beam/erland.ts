<div align="center">

![banner](.github/assets/banner.webp)

# Erland TypeScript

TypeScript client for Erland.

</div>

## Usage

_You can also define async callbacks._

### Start Connection

```typescript
// Construct the playground manager
const manager = new PlaygroundManager('ws://localhost:8080/');

// Connect to the playground and wait until
// playground is ready to receive messages
await manager.connect();
```

### Create Playground

```typescript
// Creates new playground named "example" for Erlang programming
// language. If it gives an error, returns it as a string
manager.create({
  name: 'example',
  env: 'erlang',
  callback: (response) => {
    if (response.type === 'error') {
      console.error('Found error:', response.data);
    }
  },
});
```

### Update Playground

```typescript
// Dependencies to use (playground uses hex.pm)
const dependencies = {
  surreal: 'v1.0.0',
};

// Create a file content
const content = 'main(_Args) -> io:format("WoW!~n").';

// Set our file content and dependencies
manager.update({
  name: 'example',
  content,
  dependencies,
  callback: (response) => {
    if (response.type === 'error') {
      console.error('Found error:', response.data);
    }
  },
});
```

### Run Playground

```typescript
manager.run({
  name: 'example',
  callback: (response) => {
    if (response.type === 'error') {
      console.log('Found error:', response.data);
    } else if (response.type === 'data') {
      // Output packet from playground
      console.error(response.data);
    }
  },
});
```

### Remove Playground

```typescript
// Tries to remove playground
manager.remove({
  name: 'example',
  callback: (response) => {
    if (response.type === 'error') {
      console.log('Found error:', response.data);
    } else {
      console.log('OK');
    }
  },
});
```

## Contributing

You can always report bugs and request features via [GitHub Issues](/issues).

For pull requests, make sure your code is well-formatted and at least can explain itself.

## License

Erland.ts is licensed under the MIT License.
