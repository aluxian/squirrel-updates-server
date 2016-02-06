import config from '../config';
import {asyncHandler} from './utils';
import * as updates from './updates';
import express from 'express';
import morgan from 'morgan';

const app = express();
app.use(morgan('common'));

app.get('/update/darwin', asyncHandler(updates.darwin));
app.get('/update/win32/RELEASES', asyncHandler(updates.win32_releases));
app.get('/update/linux', asyncHandler(updates.linux));

app.listen(config.port, () => {
  console.log('Server listening on port %s.', config.port);
});
