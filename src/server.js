import config from '../config';
import {asyncHandler} from './utils';
import * as updates from './updates';
import express from 'express';

const app = express();

app.get('/update/darwin', asyncHandler(updates.darwin));
app.get('/update/win32/RELEASES', asyncHandler(updates.win32_releases));

app.listen(config.port, () => {
  console.log('Server listening on port %s.', config.port);
});
