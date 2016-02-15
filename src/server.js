import config from '../config';
import {asyncHandler} from './utils';
import * as updates from './updates';
import express from 'express';
import morgan from 'morgan';

const app = express();
app.use(morgan('common'));

app.get('/update/darwin', asyncHandler(updates.darwin));
app.get('/update/win32/portable', asyncHandler(updates.win32_portable));
app.get('/update/win32/:file', asyncHandler(updates.win32_file));
app.get('/update/linux', asyncHandler(updates.linux));

app.listen(config.port, () => {
  console.log('Server listening on port %s.', config.port);
});
