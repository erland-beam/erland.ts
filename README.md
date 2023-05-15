# Erland TypeScript

Official asynchronous Erland client for Deno. We also use this for our UI.

## Usage

*You can also define async callbacks.*

### Start Connection

```typescript
// start connection
const manager = new PlaygroundManager("ws://localhost:8080/");

// wait connection to be ready
await manager.wait();
```

### Create Playground

To create a new playground check following example:

```typescript
// Creates new playground named "example" for Erlang programming language. If it gives an error, returns error as string.
manager.create("example", "erlang", (response) => {
  if (response.type === "error") {
    console.error("Found error:", response.data);
  }
});
```

### Update Playground

To update (it is actually `set`) playground code and dependencies, check
following example:

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

To actually execute playground check following example:

```typescript
manager.run("example", (response) => {
  if (response.type === "error") {
    console.log("Found error:", response.data);
  } else if (response.type === "data") {
    console.error(response.data);
  }
});
```
