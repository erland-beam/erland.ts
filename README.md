# Erland TypeScript

Official asynchronous Erland client for Deno. We also use this for our UI.

## Usage

_You can also define async callbacks._

### Start Connection

```typescript
// start connection
const manager = new PlaygroundManager("ws://localhost:8080/");

// wait connection to be ready
await manager.wait();
```

### Create Playground

```typescript
// Creates new playground named "example" for Erlang programming language. If it gives an error, returns error as string.
manager.create("example", "erlang", (response) => {
  if (response.type === "error") {
    console.error("Found error:", response.data);
  }
});
```

### Update Playground

```typescript
// Dependencies to use (playground uses hex.pm)
const deps = {
  surreal: "v1.0.0",
};

// File content (for Erlang, `main` is where program actually runs).
const content = `
main(_Args) ->
  io:format("WoW!~n").
`;

// Set our file content and dependencies.
manager.update("example", deps, content, (response) => {
  if (response.type === "error") {
    console.error("Found error:", response.data);
  }
});
```

### Run Playground

```typescript
manager.run("example", (response) => {
  if (response.type === "error") {
    console.log("Found error:", response.data);
  } else if (response.type === "data") {
    // Output packet from playground
    console.error(response.data);
  }
});
```

### Delete Playground

```typescript
// Tries to remove playground
manager.delete("example", (response) => {
  if (response.type === "error") {
    console.log("Found error:", response.data);
  } else {
    console.log("OK");
  }
});
```
