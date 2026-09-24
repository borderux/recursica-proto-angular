import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

async function enableMocking(): Promise<void> {
  if (!isDevMode()) {
    return;
  }
  const { worker } = await import('./app/api/worker');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

enableMocking().then(() =>
  bootstrapApplication(App, appConfig).catch((err: unknown) =>
    console.error(err),
  ),
);
