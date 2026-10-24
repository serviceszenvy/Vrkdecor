// The source zip leaves out the photos and video to stay small. They are identical to the ones in the
// deploy folder. Run once before building:  node scripts/restore-media.mjs ../deploy/assets
import fs from 'node:fs'
import path from 'node:path'
const from = path.resolve(process.argv[2] || '../deploy/assets')
const to = path.resolve('public/assets')
for (const dir of ['img/work', 'img/hero', 'video']) {
  fs.cpSync(path.join(from, dir), path.join(to, dir), { recursive: true })
  console.log('copied', dir)
}
