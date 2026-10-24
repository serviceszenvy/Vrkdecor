// Tell Bing (and other IndexNow engines) about every URL in the sitemap after you deploy.
// Run from your own computer after uploading:  node scripts/indexnow.mjs
const KEY = '35c9199dfd70711f730e0495d3ec99bc' // the matching key file is public/35c9199dfd70711f730e0495d3ec99bc.txt (must be live at https://www.vrkdecor.com/35c9199dfd70711f730e0495d3ec99bc.txt)
const HOST = 'www.vrkdecor.com'
const xml = await (await fetch('https://' + HOST + '/sitemap.xml')).text()
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: 'https://' + HOST + '/' + KEY + '.txt', urlList }),
})
console.log('IndexNow response:', res.status, res.statusText, '(' + urlList.length + ' URLs sent)')
