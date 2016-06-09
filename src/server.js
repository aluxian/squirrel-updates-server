import express from 'express';
import morgan from 'morgan';
import raven from 'raven';

import {asyncHandler, errorHandler1, errorHandler2} from './components/utils';
import config from './config';

import * as homeCtrl from './controllers/home';
import * as updateCtrl from './controllers/update';
import * as downloadCtrl from './controllers/download';
import * as statsCtrl from './controllers/stats';
import * as badgeCtrl from './controllers/badge';

import manifest from '../package.json';

const app = express();
let ravenClient = null;

if (config.sentry && config.sentry.dsn) {
  ravenClient = new raven.Client(config.sentry.dsn, {
    release: manifest.version
  });
}

app.use(morgan('common'));
if (ravenClient) {
  app.use(raven.middleware.express.requestHandler(ravenClient));
}

app.get('/', asyncHandler(homeCtrl.main));
app.get('/update/darwin', asyncHandler(updateCtrl.darwin));
app.get('/update/win32/portable', asyncHandler(updateCtrl.win32_portable));
app.get('/update/win32/:file', asyncHandler(updateCtrl.win32_file));
app.get('/update/linux', asyncHandler(updateCtrl.linux));
app.get('/update/:channel/darwin', asyncHandler(updateCtrl.darwin));
app.get('/update/:channel/win32/portable', asyncHandler(updateCtrl.win32_portable));
app.get('/update/:channel/win32/:file', asyncHandler(updateCtrl.win32_file));
app.get('/update/:channel/linux', asyncHandler(updateCtrl.linux));
app.get('/download/mirror/:mirror/latest', asyncHandler(downloadCtrl.latestMirror));
app.get('/download/:platform/latest', asyncHandler(downloadCtrl.latest));
app.get('/stats', asyncHandler(statsCtrl.main));
app.get('/badge/:type.svg', asyncHandler(badgeCtrl.main));

app.use(errorHandler1);
if (ravenClient) {
  app.use(raven.middleware.express.errorHandler(ravenClient));
}
app.use(errorHandler2);

app.listen(config.port, config.host, () => {
  console.log('Server listening on port %s.', config.port);
});
