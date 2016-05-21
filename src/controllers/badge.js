import request from 'request';
import numeral from 'numeral';

import BadRequestError from '../errors/BadRequestError';
import stats from '../components/stats';

export async function main(req, res) {
  const type = req.params.type;
  if (!['downloads'].includes(type)) throw new BadRequestError(`Invalid type '${type}'.`);

  const allStats = await stats.get();
  const count = numeral(allStats.platforms_r.all).format('0.0a');
  const link = 'https://img.shields.io/badge/downloads-' + count + '-brightgreen.svg';

  request(link).pipe(res);
}
