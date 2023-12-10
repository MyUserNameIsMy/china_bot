export const BASE_Q =
  process.env.MODE == 'dev'
    ? 'http://127.0.0.1:3000/ask'
    : 'http://77.243.80.21:3000/ask';
