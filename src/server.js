import {asyncHandler} from './components/utils';
import config from './config';
import express from 'express';
import morgan from 'morgan';

import * as updateCtrl from './controllers/update';

const app = express();
app.use(morgan('common'));

app.get('/update/darwin', asyncHandler(updateCtrl.darwin));
app.get('/update/win32/portable', asyncHandler(updateCtrl.win32_portable));
app.get('/update/win32/:file', asyncHandler(updateCtrl.win32_file));
app.get('/update/linux', asyncHandler(updateCtrl.linux));

app.listen(config.port, () => {
  console.log('Server listening on port %s.', config.port);
});
