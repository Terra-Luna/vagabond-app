// only required for dev
// in prod, foundry loads vagabond-lite.mjs, which is compiled by vite/rollup
// in dev, foundry loads vagabond-lite.mjs, this file, which loads vagabond-lite.ts
import './src/vagabond-lite.ts';