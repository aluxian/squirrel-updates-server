import stats from '../components/stats';

export async function main(req, res) {
  res.json(await stats.get());
}
