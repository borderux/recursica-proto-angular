import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

async function enableMocking(): Promise<void> {
  const { worker } = await import('./app/api/worker');
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: `${document.baseURI}mockServiceWorker.js` },
  });
}

enableMocking().then(() =>
  bootstrapApplication(App, appConfig).catch((err: unknown) =>
    console.error(err),
  ),
);
