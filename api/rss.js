export const config = { runtime: 'edge' };

const RSS_FEEDS = [
  'https://www.yna.co.kr/rss/news.xml',
  'https://hani.co.kr/rss',
  'https://www.khan.co.kr/rss/rssdata/total_news.xml',
];

function extractItems(xml, source) {
  const items = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  for (const match of xml.matchAll(itemRe)) {
    const block = match[1];
    const read = tag => (block.match(new RegExp(`<${tag}(?:[^>]*)>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1] || '')
      .replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
    const title = read('title');
    if (title.length > 6) items.push({ title, description: read('description').slice(0, 220), link: read('link'), source });
  }
  if (items.length) return items;
  return extractTitles(xml).map(title => ({ title, source }));
}
function extractTitles(xml) {
  const titles = [];
  const cdataRe = /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/g;
  for (const m of xml.matchAll(cdataRe)) {
    const t = m[1].trim();
    if (t.length > 6) titles.push(t);
  }
  if (titles.length > 0) return titles.slice(1);
  let first = true;
  const plainRe = /<title>([\s\S]*?)<\/title>/g;
  for (const m of xml.matchAll(plainRe)) {
    if (first) { first = false; continue; }
    const t = m[1]
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/<[^>]+>/g, '').trim();
    if (t.length > 6) titles.push(t);
  }
  return titles;
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
  const results = await Promise.allSettled(
    RSS_FEEDS.map(url =>
      fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsReader/1.0)' },
        signal: AbortSignal.timeout(5000),
      })
        .then(r => r.text())
        .then(xml => extractItems(xml, new URL(url).hostname).slice(0, 8))
    )
  );
  const headlines = [];
  for (const r of results) {
    if (r.status === 'fulfilled') headlines.push(...r.value);
  }
  return new Response(JSON.stringify({ items: headlines.slice(0, 28), headlines: headlines.map(item => item.title) }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'max-age=300, s-maxage=300',
    },
  });
}
