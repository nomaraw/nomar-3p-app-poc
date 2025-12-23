// Re-export the Agent Workspace SDK for browser usage.
// The `App` symbol is what you call to `init()` inside your iframe.
export * as AppModule from '@amazon-connect/app';
export const App = AppModule.App;
