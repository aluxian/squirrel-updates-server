const store = {};

async function getter(key, getData, validity) {
  if (!store[key] || store[key].expiresAt < Date.now()) {
    store[key] = {
      data: await getData(),
      expiresAt: Date.now() + validity
    };
  }

  return store[key].data;
}

export default {
  get: getter
};
