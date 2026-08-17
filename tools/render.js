/*
 * render.js — rasterise tools/textile.html at full resolution with Chromium.
 *
 * No photography was available for this project and no image host is reachable
 * from the build environment, so the site's imagery is generated. Running this
 * regenerates every file in public/images/textile/.
 *
 *   node tools/render.js
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const OUT = path.join(__dirname, '..', 'public', 'images', 'textile');
fs.mkdirSync(OUT, { recursive: true });

// cloth colour, thread colour, technique — one entry per image the site needs
const JOBS = [
  { n: 'gulbahar-a', base: '#C8407E', thread: '#F6E9D2', work: 'thread',   seed: 3,  w: 1200, h: 1600 },
  { n: 'gulbahar-b', base: '#B8336F', thread: '#F6E9D2', work: 'zari',     seed: 12, w: 1200, h: 1600 },
  { n: 'citrine-a',  base: '#DFB63C', thread: '#FFF6DC', work: 'shisha',   seed: 21, w: 1200, h: 1600 },
  { n: 'citrine-b',  base: '#E4C258', thread: '#FFF6DC', work: 'sequin',   seed: 33, w: 1200, h: 1600 },
  { n: 'violet-a',   base: '#54459B', thread: '#E7DFF7', work: 'sequin',   seed: 41, w: 1200, h: 1600 },
  { n: 'violet-b',   base: '#4A3D8C', thread: '#E7DFF7', work: 'thread',   seed: 52, w: 1200, h: 1600 },
  { n: 'marigold-a', base: '#D8A43A', thread: '#FBEFD2', work: 'zari',     seed: 63, w: 1200, h: 1600 },
  { n: 'marigold-b', base: '#CE9B33', thread: '#FBEFD2', work: 'thread',   seed: 71, w: 1200, h: 1600 },
  { n: 'florals-a',  base: '#EFE7D8', thread: '#C98BA4', work: 'applique', seed: 82, w: 1200, h: 1600 },
  { n: 'florals-b',  base: '#E9E0CE', thread: '#C98BA4', work: 'thread',   seed: 91, w: 1200, h: 1600 },
  { n: 'coral-a',    base: '#E08A72', thread: '#FBEADF', work: 'thread',   seed: 14, w: 1200, h: 1600 },
  { n: 'coral-b',    base: '#D97F66', thread: '#FBEADF', work: 'zari',     seed: 26, w: 1200, h: 1600 },
  // handwork macros — square, tighter weave, one technique each
  { n: 'macro-thread',   base: '#C8407E', thread: '#F6E9D2', work: 'thread',   seed: 5,  w: 1100, h: 1100, scale: 0.7 },
  { n: 'macro-shisha',   base: '#DFB63C', thread: '#FFF6DC', work: 'shisha',   seed: 6,  w: 1100, h: 1100, scale: 0.7 },
  { n: 'macro-zari',     base: '#B8336F', thread: '#C9A24E', work: 'zari',     seed: 7,  w: 1100, h: 1100, scale: 0.7 },
  { n: 'macro-sequin',   base: '#54459B', thread: '#E7DFF7', work: 'sequin',   seed: 8,  w: 1100, h: 1100, scale: 0.7 },
  { n: 'macro-applique', base: '#EFE7D8', thread: '#C98BA4', work: 'applique', seed: 9,  w: 1100, h: 1100, scale: 0.7 },
  // atmosphere — wide, plain cloth for banners and the studio slots
  { n: 'cloth-ivory',   base: '#E9E0CE', thread: '#C9A24E', work: 'zari',   seed: 101, w: 1800, h: 1200, scale: 0.8 },
  { n: 'cloth-fuchsia', base: '#C8407E', thread: '#F6E9D2', work: 'thread', seed: 102, w: 1800, h: 1200, scale: 0.8 },
  { n: 'cloth-violet',  base: '#54459B', thread: '#E7DFF7', work: 'sequin', seed: 103, w: 1800, h: 1200, scale: 0.8 },
];

(async () => {
  const browser = await chromium.launch();
  const file = 'file://' + path.join(__dirname, 'textile.html');
  for (const j of JOBS) {
    const page = await browser.newPage({ viewport: { width: j.w, height: j.h } });
    const q = new URLSearchParams({
      w: j.w, h: j.h, base: j.base, thread: j.thread, work: j.work,
      seed: j.seed, scale: j.scale || 1,
    });
    await page.goto(`${file}?${q}`, { waitUntil: 'load' });
    await page.waitForFunction(() => document.title === 'ready', { timeout: 60000 });
    await page.locator('canvas').screenshot({ path: path.join(OUT, `${j.n}.jpg`), quality: 88, type: 'jpeg' });
    await page.close();
    console.log('rendered', j.n, `${j.w}x${j.h}`);
  }
  await browser.close();
})();
