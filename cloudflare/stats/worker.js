// Statistics for cjmin.me and world.cjmin.me (see README → Statistics).
//
//   POST /api/v        one event from either site (src/lib/stats.ts)
//   GET  /stats/       the owner's dashboard, behind STATS_KEY
//
// The IP address is used only while handling a request, to look up nothing but the hash below;
// Cloudflare supplies the estimated place and network owner in request.cf. Set the key yourself:
//   npx wrangler secret put STATS_KEY
import dashboardHtml from './dashboard.html'
import worldMap from './map.txt'

// Each site's prefix in the stored address: world.cjmin.me/atlas/, but plain /talks/1/ for the main site
const SITES = new Map([['https://cjmin.me', ''], ['https://world.cjmin.me', 'world.cjmin.me']])
const OWN_HOSTS = new Set(['cjmin.me', 'world.cjmin.me'])
const COOKIE = 'stats_session'
const SESSION_DAYS = 30
const KEEP_DAYS = 400
const MAX_LOGIN_FAILS_PER_HOUR = 30
const DAY = 86400000

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|embedly|wget|curl|python|httpclient|axios|go-http|node-fetch|scrapy|phantom|puppeteer|playwright|selenium/i
const CLOUD = /amazon|aws\b|google|microsoft|azure|digitalocean|ovh|hetzner|linode|akamai|cloudflare|fastly|oracle|alibaba|tencent|vultr|contabo|m247|datacamp|leaseweb|choopa|scaleway|apple inc|icloud|vpn|hosting|data ?cent(er|re)|server/i
const ACADEMIC = /universit|college|institute|academy|academic|school|education|research|\bedu\b|kaist|postech|unist|gist\b|dgist|kreonet|kren\b|kisti|cernet|geant|internet2|\bjanet\b|renater|대학|연구/i
const ISP = /telecom|telekom|broadband|lg ?(dacom|uplus|u\+|powercomm)|\bsk ?(telecom|broadband)|\bkt\b|comcast|verizon|at&t|charter|spectrum|t-mobile|vodafone|orange|china (mobile|unicom)|chinanet|ntt|kddi|softbank|rakuten|cable|mobile|wireless|cellular|telephone|communications?|\bisp\b|\bdsl\b|internet|network/i

/** What sort of network it is, from its owner's name. Only a guide: these are plain name matches. */
export function classify(org) {
  if (!org) return 'unknown'
  if (CLOUD.test(org)) return 'cloud'
  if (ACADEMIC.test(org)) return 'academic'
  if (ISP.test(org)) return 'isp'
  return 'org'
}

const clip = (v, n) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, n) : null)

// The same parameters GoatCounter takes out of an address, and reads the source and campaign from
const TRACKING = /^(fbclid|gclid|ref|src|source|campaign|mc_cid|mc_eid|nsukey|isappinstalled|stats|utm_.*)$/i

function cleanPath(p, query) {
  const s = clip(p, 200)
  if (!s || s[0] !== '/') return null
  const kept = new URLSearchParams(query)
  for (const key of [...kept.keys()]) if (TRACKING.test(key)) kept.delete(key)
  if (['singlemessage', 'groupmessage'].includes(kept.get('from'))) kept.delete('from')
  const rest = kept.toString()
  return (s.split(/[?#]/)[0] + (rest ? `?${rest}` : '')).slice(0, 200)
}

function firstParam(params, names) {
  for (const name of names) {
    const v = clip(params.get(name)?.trim(), 80)
    if (v) return v
  }
  return null
}

const REF_GROUPS = {
  'news.ycombinator.com': 'Hacker News', 'hn.algolia.com': 'Hacker News', 'hckrnews.com': 'Hacker News', 'hackerweb.app': 'Hacker News',
  'mail.google.com': 'Email', 'com.google.android.gm': 'Email', 'mail.yahoo.com': 'Email', 'mail.naver.com': 'Email', 'mail.daum.net': 'Email', 'outlook.live.com': 'Email', 'outlook.office.com': 'Email',
  'inoreader.com': 'RSS', 'feedly.com': 'RSS', 'usepanda.com': 'RSS', 'org.fox.ttrss': 'RSS', 'com.innologica.inoreader': 'RSS',
  'com.google.android.googlequicksearchbox': 'Google',
  'm.facebook.com': 'Facebook', 'l.facebook.com': 'Facebook', 'lm.facebook.com': 'Facebook', 'facebook.com': 'Facebook',
  'old.reddit.com': 'Reddit', 'reddit.com': 'Reddit', 'np.reddit.com': 'Reddit', 'i.reddit.com': 'Reddit', 'com.andrewshu.android.reddit': 'Reddit',
  'org.telegram.messenger': 'Telegram', 't.me': 'Telegram', 'com.slack': 'Slack', 'app.slack.com': 'Slack',
  't.co': 'X (Twitter)', 'x.com': 'X (Twitter)', 'twitter.com': 'X (Twitter)',
  'lnkd.in': 'LinkedIn', 'linkedin.com': 'LinkedIn', 'com.linkedin.android': 'LinkedIn',
  'baidu.com': 'Baidu', 'm.baidu.com': 'Baidu', 'tieba.baidu.com': 'Baidu',
  'naver.com': 'Naver', 'search.naver.com': 'Naver', 'm.search.naver.com': 'Naver', 'm.naver.com': 'Naver',
  'daum.net': 'Daum', 'search.daum.net': 'Daum', 'm.search.daum.net': 'Daum',
  'bing.com': 'Bing', 'duckduckgo.com': 'DuckDuckGo',
}

function refGroup(host) {
  if (host.startsWith('google.')) return 'Google'   // scholar.google.com stays its own name
  if (host.includes('yandex.')) return 'Yandex'
  if (host.includes('search.yahoo.com')) return 'Yahoo'
  return REF_GROUPS[host] ?? null
}

/** Where a visit came from, without the referring address's query string, which can hold anything. */
function referrer(r) {
  try {
    const u = new URL(r)
    const app = u.protocol === 'android-app:'
    if (!app && !/^https?:$/.test(u.protocol)) return { ref: null, refPath: null }
    const host = u.hostname.replace(/^www\./, '').toLowerCase().slice(0, 100)
    if (OWN_HOSTS.has(host)) return { ref: null, refPath: null }
    const path = app ? '' : u.pathname.replace(/\/$/, '')
    return { ref: refGroup(host) ?? host, refPath: path ? clip(host + path, 160) : null }
  } catch { return { ref: null, refPath: null } }
}

function deviceOf(ua) {
  if (/ipad|tablet/i.test(ua)) return 'tablet'
  return /mobi|android|iphone/i.test(ua) ? 'mobile' : 'desktop'
}

const major = (v, parts = 1) => (v ? v.split('.').slice(0, parts).join('.') : null)

/** Browser and version from the user agent, most specific first: most browsers also say Chrome or Safari. */
function browserOf(ua) {
  let m
  if ((m = ua.match(/KAKAOTALK(?:\s+([\d.]+))?/i))) return ['KakaoTalk', major(m[1])]
  if (/NAVER\(inapp/i.test(ua)) return ['NAVER app', null]
  if ((m = ua.match(/Instagram\s+([\d.]+)/i))) return ['Instagram', major(m[1])]
  if ((m = ua.match(/\bEdg(?:e|A|iOS)?\/([\d.]+)/))) return ['Edge', major(m[1])]
  if ((m = ua.match(/\bWhale\/([\d.]+)/))) return ['Whale', major(m[1])]
  if ((m = ua.match(/SamsungBrowser\/([\d.]+)/))) return ['Samsung Internet', major(m[1])]
  if ((m = ua.match(/\bOPR\/([\d.]+)/))) return ['Opera', major(m[1])]
  if ((m = ua.match(/\b(?:Firefox|FxiOS)\/([\d.]+)/))) return ['Firefox', major(m[1])]
  if ((m = ua.match(/\b(?:Chrome|CriOS)\/([\d.]+)/))) return ['Chrome', major(m[1])]
  if ((m = ua.match(/Version\/([\d.]+).*Safari\//))) return ['Safari', major(m[1], 2)]
  return ['Other', null]
}

const WINDOWS = { '10.0': '10 or 11', 6.3: '8.1', 6.2: '8', 6.1: '7' }

function systemOf(ua) {
  let m
  if ((m = ua.match(/(?:iPhone|iPad|iPod).*? OS (\d+)[_.](\d+)/))) return ['iOS', `${m[1]}.${m[2]}`]
  if ((m = ua.match(/Android (\d+(?:\.\d+)?)/))) return ['Android', m[1]]
  if ((m = ua.match(/Windows NT ([\d.]+)/))) return ['Windows', WINDOWS[m[1]] ?? m[1]]
  if ((m = ua.match(/Mac OS X (\d+)[_.](\d+)/))) return ['macOS', `${m[1]}.${m[2]}`]
  if (/CrOS/.test(ua)) return ['ChromeOS', null]
  if (/Linux/.test(ua)) return ['Linux', null]
  return ['Other', null]
}

const round1 = v => { const n = parseFloat(v); return Number.isFinite(n) ? Math.round(n * 10) / 10 : null }
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
const kstDay = ms => new Date(ms + 9 * 3600000).toISOString().slice(0, 10)

let saltCache = null

async function saltFor(env, day) {
  if (saltCache?.day === day) return saltCache.salt
  const fresh = hex(crypto.getRandomValues(new Uint8Array(16)))
  const made = await env.DB.prepare('INSERT OR IGNORE INTO salts (day, salt) VALUES (?1, ?2)').bind(day, fresh).run()
  const row = await env.DB.prepare('SELECT salt FROM salts WHERE day = ?1').bind(day).first()
  saltCache = { day, salt: row.salt }
  if (made.meta.changes) await cleanup(env, day)   // only the day's first event gets here
  return row.salt
}

/** Removes yesterday's salt, which ends any link between days, and what has passed its retention. */
async function cleanup(env, today) {
  const now = Date.now()
  await env.DB.batch([
    env.DB.prepare('DELETE FROM events WHERE ts < ?1').bind(now - KEEP_DAYS * DAY),
    env.DB.prepare('DELETE FROM salts WHERE day < ?1').bind(today),
    env.DB.prepare('DELETE FROM login_fails WHERE hour < ?1').bind(new Date(now - DAY).toISOString().slice(0, 13)),
  ])
}

async function visitorHash(env, ip, ua, now) {
  const salt = await saltFor(env, kstDay(now))
  const data = new TextEncoder().encode(`${salt}|${ip}|${ua}`)
  return hex(await crypto.subtle.digest('SHA-256', data)).slice(0, 16)
}

async function store(request, env, body, sitePrefix) {
  const ua = request.headers.get('user-agent') ?? ''
  const now = Date.now()
  const visitor = await visitorHash(env, request.headers.get('cf-connecting-ip') ?? '', ua, now)

  if (body.k === 'time') {
    const vid = clip(body.id, 16)
    if (!vid) return
    const secs = Math.min(3600, Math.max(0, Math.round(Number(body.s) || 0)))
    const depth = Math.min(100, Math.max(0, Math.round(Number(body.d) || 0)))
    await env.DB.prepare("UPDATE events SET secs = ?1, depth = ?2 WHERE vid = ?3 AND visitor = ?4 AND type = 'view'")
      .bind(secs, depth, vid, visitor).run()
    return
  }

  const query = clip(body.q, 500) ?? ''
  const path = cleanPath(body.p, query)
  if (!path) return
  const page = sitePrefix + path
  const label = body.k === 'click' ? clip(body.l, 120) : null
  if (body.k === 'click' && !label) return
  const cf = request.cf ?? {}
  const org = clip(cf.asOrganization, 120)
  // A source in the link says more than the referrer, which is often hidden.
  const params = new URLSearchParams(query)
  const from = body.k === 'view' ? referrer(body.r) : { ref: null, refPath: null }
  const source = body.k === 'view' ? firstParam(params, ['utm_source', 'ref', 'src', 'source']) : null
  const campaign = body.k === 'view' ? firstParam(params, ['utm_campaign', 'campaign']) : null
  const [browser, browserVer] = browserOf(ua)
  const [os, osVer] = systemOf(ua)
  const width = Math.round(Number(body.s))
  await env.DB.prepare(`INSERT INTO events
      (ts, type, page, label, ref, country, region, city, lat, lon, org, asn, kind, visitor, vid, device, browser, lang,
       title, ref_path, campaign, browser_ver, os, os_ver, width)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25)`)
    .bind(
      now, body.k, page, label, source ?? from.ref,
      clip(cf.country, 2), clip(cf.region, 80), clip(cf.city, 80), round1(cf.latitude), round1(cf.longitude),
      org, Number.isInteger(cf.asn) ? cf.asn : null, classify(org), visitor, clip(body.id, 16),
      deviceOf(ua), browser, clip((request.headers.get('accept-language') ?? '').split(/[,;]/)[0], 12),
      clip(body.t, 200) || null, from.refPath, campaign, browserVer, os, osVer, width > 0 && width < 20000 ? width : null,
    ).run()
}

async function collect(request, env, ctx) {
  if (request.method !== 'POST') return new Response(null, { status: 405 })
  const origin = request.headers.get('origin')
  if (!SITES.has(origin)) return new Response(null, { status: 403 })
  const ua = request.headers.get('user-agent') ?? ''
  if (!ua || BOT.test(ua)) return new Response(null, { status: 204 })
  if (/(?:^|;\s*)stats_off=1/.test(request.headers.get('cookie') ?? '')) return new Response(null, { status: 204 })
  const text = await request.text()
  if (text.length > 2048) return new Response(null, { status: 413 })
  let body
  try { body = JSON.parse(text) } catch { return new Response(null, { status: 400 }) }
  if (!['view', 'click', 'time'].includes(body?.k)) return new Response(null, { status: 400 })
  ctx.waitUntil(store(request, env, body, SITES.get(origin)).catch(e => console.error('stats store failed', e)))
  return new Response(null, { status: 204 })
}

// ---- the owner's session: a signed expiry time in an HttpOnly cookie

const ownerKey = env => String(env.STATS_KEY ?? '').trim()

async function sign(env, text) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(ownerKey(env)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(text)))
}

function sameText(a, b) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

async function isOwner(request, env) {
  if (!ownerKey(env)) return false
  const cookie = (request.headers.get('cookie') ?? '').split(/;\s*/).find(c => c.startsWith(`${COOKIE}=`))
  const [exp, mac] = (cookie?.slice(COOKIE.length + 1) ?? '').split('.')
  if (!exp || !mac || Number(exp) < Date.now()) return false
  return sameText(mac, await sign(env, exp))
}

const PAGE_HEADERS = {
  'content-type': 'text/html; charset=utf-8',
  'cache-control': 'no-store',
  'x-robots-tag': 'noindex, nofollow',
  'referrer-policy': 'same-origin',
  'x-content-type-options': 'nosniff',
  'content-security-policy': "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
}

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' },
})

function loginPage(message = '') {
  const setup = message === 'setup'
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Stats</title><style>
:root{color-scheme:light dark;--bg:#fff;--fg:#1d1d1f;--mut:#6e6e73;--line:rgba(0,0,0,.12);--bar:#f4f3f1}
@media(prefers-color-scheme:dark){:root{--bg:#000;--fg:#f5f5f7;--mut:#86868b;--line:rgba(255,255,255,.14);--bar:#1e1e21}}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--bg);color:var(--fg);font:16px/1.5 Inter,system-ui,-apple-system,sans-serif}
.w{width:min(380px,calc(100vw - 32px));border:1px solid var(--line);border-radius:18px;overflow:hidden;box-shadow:0 22px 44px -26px rgba(0,0,0,.3)}
.t{height:40px;display:flex;align-items:center;gap:8px;padding:0 16px;background:var(--bar);border-bottom:1px solid var(--line)}
.t i{width:13px;height:13px;border-radius:50%}.b{padding:24px}h1{margin:0 0 6px;font-size:24px;letter-spacing:-.02em}p{margin:0 0 16px;color:var(--mut);font-size:15px}
input,button{width:100%;box-sizing:border-box;font:inherit;padding:10px 12px;border-radius:10px;border:1px solid var(--line);background:transparent;color:inherit}
button{margin-top:10px;background:#e8604e;border-color:#e8604e;color:#fff;font-weight:600;cursor:pointer}code{font-size:13px;word-break:break-all}.e{color:#c0392b;font-size:14px}
</style></head><body><main class="w"><div class="t"><i style="background:#ec6a5e"></i><i style="background:#f4bf4f"></i><i style="background:#61c554"></i></div><div class="b">
<h1>Stats</h1>${setup
    ? '<p>The key is not set yet. Run this in <code>cloudflare/stats</code>, then reload:</p><p><code>npx wrangler secret put STATS_KEY</code></p>'
    : `<p>For the owner of this site.</p>${message ? `<p class="e">${message}</p>` : ''}<form method="post" action="/stats/login"><input type="password" name="key" placeholder="Key" aria-label="Key" autocomplete="current-password" autofocus required><button>Open</button></form>`}
</div></main></body></html>`
}

async function login(request, env) {
  if (!ownerKey(env)) return new Response(loginPage('setup'), { status: 503, headers: PAGE_HEADERS })
  const hour = new Date().toISOString().slice(0, 13)
  const fails = await env.DB.prepare('SELECT n FROM login_fails WHERE hour = ?1').bind(hour).first()
  if ((fails?.n ?? 0) >= MAX_LOGIN_FAILS_PER_HOUR) return new Response(loginPage('Too many tries. Try again in an hour.'), { status: 429, headers: PAGE_HEADERS })
  const form = await request.formData()
  const given = String(form.get('key') ?? '').trim()
  const [a, b] = await Promise.all([given, ownerKey(env)].map(async s => hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))))
  if (!sameText(a, b)) {
    await env.DB.prepare('INSERT INTO login_fails (hour, n) VALUES (?1, 1) ON CONFLICT (hour) DO UPDATE SET n = n + 1').bind(hour).run()
    return new Response(loginPage('That key is not right.'), { status: 401, headers: PAGE_HEADERS })
  }
  const exp = String(Date.now() + SESSION_DAYS * DAY)
  return new Response(null, { status: 303, headers: {
    location: '/stats/', 'cache-control': 'no-store',
    'set-cookie': `${COOKIE}=${exp}.${await sign(env, exp)}; Path=/stats; Max-Age=${SESSION_DAYS * 86400}; HttpOnly; Secure; SameSite=Strict`,
  } })
}

// ---- the numbers behind the dashboard

const VISIT_GAP = 30 * 60000
const MAX_VISITS = 60

/** Joins events (oldest first) into visits: same daily code, with no gap over 30 minutes. The code itself stays here. */
export function visitPaths(rows) {
  const open = new Map(), visits = []
  for (const r of rows) {
    let v = open.get(r.visitor)
    if (!v || r.ts - v.end > VISIT_GAP) {
      v = { start: r.ts, end: r.ts, ref: null, country: r.country, region: r.region, city: r.city, org: r.org, kind: r.kind, device: r.device, steps: [] }
      open.set(r.visitor, v)
      visits.push(v)
    }
    v.end = r.ts
    v.ref ??= r.ref
    const last = v.steps[v.steps.length - 1]
    if (r.type === 'click') v.steps.push({ click: r.label, title: r.title })
    else if (last?.page === r.page) last.secs = (last.secs ?? 0) + (r.secs ?? 0) || null   // a reload is not a new step
    else v.steps.push({ page: r.page, title: r.title, secs: r.secs })
  }
  return visits.reverse()
}

/** Rows of (name, child, views) as a list with its breakdown, largest first: Chrome, then Chrome 120 and so on. */
function tree(rows) {
  const out = new Map()
  for (const { name, child, views } of rows) {
    const node = out.get(name) ?? { name, views: 0, children: [] }
    node.views += views
    if (child !== null && child !== '') node.children.push({ name: String(child), views })
    out.set(name, node)
  }
  return [...out.values()].sort((a, b) => b.views - a.views)
}

const pagePattern = (page, exact) => {
  if (!page) return ''
  const safe = page.replace(/[\\%_]/g, '\\$&')
  return exact ? safe : `%${safe}%`
}

/** Everything the dashboard shows for a period, scoped by the page filter when there is one. */
export async function summary(env, { from, to, by, cloud, page, exact }) {
  const span = to - from
  const hourly = from > 0 && (by === 'hour' ? span <= 14 * DAY : by === 'day' ? false : span <= 2 * DAY)
  const pattern = pagePattern(page, exact)
  const scope = "ts >= ?1 AND ts < ?2 AND (?3 = 1 OR kind != 'cloud') AND (?4 = '' OR page LIKE ?4 ESCAPE '\\')"
  const q = (sql, a = from, b = to) => env.DB.prepare(sql).bind(a, b, cloud ? 1 : 0, pattern)
  const bucket = `strftime('${hourly ? '%Y-%m-%d %H:00' : '%Y-%m-%d'}', ts / 1000, 'unixepoch', '+9 hours')`
  const totalsSql = `SELECT COALESCE(SUM(type = 'view'), 0) AS views, COALESCE(SUM(type = 'click'), 0) AS clicks,
      COUNT(DISTINCT visitor) AS visitors, COUNT(DISTINCT country) AS countries,
      COUNT(DISTINCT CASE WHEN kind IN ('academic', 'org') THEN org END) AS institutions
    FROM events WHERE ${scope}`
  const breakdown = (name, child, extra = '') => q(`SELECT ${name} AS name, ${child} AS child, COUNT(*) AS views
    FROM events WHERE ${scope} AND type = 'view' ${extra} GROUP BY 1, 2 ORDER BY views DESC LIMIT 300`)
  const results = await env.DB.batch([
    q(totalsSql),
    from > 0 ? q(totalsSql, from - span, from) : q(totalsSql, 0, 0),
    q(`SELECT ${bucket} AS bucket, COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors
       FROM events WHERE ${scope} AND type = 'view' GROUP BY bucket ORDER BY bucket`),
    q(`SELECT page, MAX(title) AS title, COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors, ROUND(AVG(secs)) AS secs, ROUND(AVG(depth)) AS depth
       FROM events WHERE ${scope} AND type = 'view' GROUP BY page ORDER BY views DESC LIMIT 50`),
    q(`SELECT page, ${bucket} AS bucket, COUNT(*) AS views FROM events WHERE ${scope} AND type = 'view' AND page IN
         (SELECT page FROM events WHERE ${scope} AND type = 'view' GROUP BY page ORDER BY COUNT(*) DESC LIMIT 12)
       GROUP BY page, bucket ORDER BY bucket LIMIT 3000`),
    breakdown(`COALESCE(ref, 'Direct or hidden')`, 'ref_path'),
    breakdown('campaign', 'ref', 'AND campaign IS NOT NULL'),
    q(`SELECT label, MAX(title) AS title, COUNT(*) AS clicks, COUNT(DISTINCT visitor) AS visitors
       FROM events WHERE ${scope} AND type = 'click' GROUP BY label ORDER BY clicks DESC LIMIT 50`),
    q(`SELECT country, region, city, ROUND(AVG(lat), 1) AS lat, ROUND(AVG(lon), 1) AS lon, COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors
       FROM events WHERE ${scope} AND type = 'view' AND lat IS NOT NULL GROUP BY country, region, city ORDER BY views DESC LIMIT 200`),
    q(`SELECT country, region, city, org, COUNT(*) AS views
       FROM events WHERE ${scope} AND type = 'view' AND lat IS NOT NULL AND org IS NOT NULL
       GROUP BY country, region, city, org ORDER BY views DESC LIMIT 800`),
    q(`SELECT org, MAX(asn) AS asn, MAX(kind) AS kind, COUNT(*) AS events, SUM(type = 'view') AS views, COUNT(DISTINCT visitor) AS visitors,
         MAX(ts) AS last, GROUP_CONCAT(DISTINCT city) AS cities, MAX(country) AS country
       FROM events WHERE ${scope} AND org IS NOT NULL GROUP BY org ORDER BY views DESC, last DESC LIMIT 150`),
    q(`SELECT org, page, COUNT(*) AS views FROM events WHERE ${scope} AND type = 'view' AND org IS NOT NULL
       GROUP BY org, page ORDER BY views DESC LIMIT 600`),
    breakdown(`COALESCE(browser, 'Other')`, 'browser_ver'),
    breakdown(`COALESCE(os, 'Other')`, 'os_ver'),
    breakdown(`CASE WHEN width IS NULL OR width = 0 THEN 'Unknown' WHEN width <= 600 THEN 'Phones' WHEN width <= 1000 THEN 'Tablets' WHEN width <= 1920 THEN 'Desktop' ELSE 'Desktop HD' END`, 'width'),
    breakdown(`COALESCE(NULLIF(lang, ''), 'Unknown')`, `''`),
    breakdown(`COALESCE(country, '')`, 'region'),
  ])
  const [totals, prev, trend, pages, pageTrend, refs, campaigns, clicks, cities, cityOrgs, orgs, orgPages, browsers, systems, sizes, langs, countries] = results.map(r => r.results)
  const pagesByOrg = {}
  for (const row of orgPages) (pagesByOrg[row.org] ??= []).length < 3 && pagesByOrg[row.org].push(row.page)
  const placeKey = r => `${r.country}|${r.region}|${r.city}`
  const orgsByPlace = {}
  for (const row of cityOrgs) (orgsByPlace[placeKey(row)] ??= []).push({ org: row.org, views: row.views })
  return {
    from, to, hourly, span, totals: totals[0], prev: from > 0 ? prev[0] : null, trend, pages, pageTrend, clicks,
    refs: tree(refs), campaigns: tree(campaigns), browsers: tree(browsers), systems: tree(systems), sizes: tree(sizes), langs: tree(langs), countries: tree(countries),
    cities: cities.map(c => ({ ...c, orgs: (orgsByPlace[placeKey(c)] ?? []).slice(0, 4) })),
    orgs: orgs.map(o => ({ ...o, pages: pagesByOrg[o.org] ?? [] })),
  }
}

/** The latest visits as paths. A filter keeps the visits that touched that page, with all of their steps. */
export async function paths(env, { from, to, cloud, page, exact }) {
  const { results } = await env.DB.prepare(`SELECT visitor, ts, type, page, label, title, ref, country, region, city, org, kind, device, secs
    FROM events WHERE ts >= ?1 AND ts < ?2 AND (?3 = 1 OR kind != 'cloud') ORDER BY ts DESC, id DESC LIMIT 1500`).bind(from, to, cloud ? 1 : 0).all()
  const visits = visitPaths(results.reverse())
  const needle = page?.toLowerCase()
  const hit = s => (exact ? s.page?.toLowerCase() === needle : s.page?.toLowerCase().includes(needle))
  return (needle ? visits.filter(v => v.steps.some(hit)) : visits).slice(0, MAX_VISITS)
}

/** One page of the raw records for the CSV download, without the visitor code. */
async function exportRows(env, { from, to }, after) {
  const { results } = await env.DB.prepare(`SELECT id, ts, type, page, title, label, ref, ref_path, campaign, country, region, city, lat, lon, org, asn, kind,
      device, browser, browser_ver, os, os_ver, width, lang, secs, depth
    FROM events WHERE id > ?1 AND ts >= ?2 AND ts < ?3 ORDER BY id LIMIT 2000`).bind(after, from, to).all()
  return results
}

export async function live(env, includeCloud) {
  const scope = includeCloud ? '' : "AND kind != 'cloud'"
  const [events, active] = await env.DB.batch([
    env.DB.prepare(`SELECT id, ts, type, page, label, ref, country, region, city, lat, lon, org, kind, device FROM events
      WHERE 1 = 1 ${scope} ORDER BY id DESC LIMIT 30`),
    env.DB.prepare(`SELECT COUNT(DISTINCT visitor) AS n FROM events WHERE ts >= ?1 ${scope}`).bind(Date.now() - 5 * 60000),
  ])
  return { events: events.results, active: active.results[0].n, now: Date.now() }
}

async function dashboard(request, env) {
  const url = new URL(request.url)
  if (url.pathname === '/stats') return Response.redirect(`${url.origin}/stats/`, 301)
  if (url.pathname === '/stats/login' && request.method === 'POST') return login(request, env)
  if (url.pathname === '/stats/logout' && request.method === 'POST') {
    return new Response(null, { status: 303, headers: { location: '/stats/', 'set-cookie': `${COOKIE}=; Path=/stats; Max-Age=0; HttpOnly; Secure; SameSite=Strict` } })
  }
  const owner = await isOwner(request, env)
  if (url.pathname === '/stats/') {
    if (owner) return new Response(dashboardHtml, { headers: PAGE_HEADERS })
    return new Response(loginPage(ownerKey(env) ? '' : 'setup'), { status: ownerKey(env) ? 200 : 503, headers: PAGE_HEADERS })
  }
  if (!owner) return json({ error: 'not signed in' }, 401)
  const get = key => url.searchParams.get(key)
  const number = (key, fallback) => { const n = Number(get(key)); return get(key) !== null && Number.isFinite(n) ? n : fallback }
  const cloud = get('cloud') === '1'
  const to = number('to', Date.now() + 1000)
  const period = { from: number('from', to - 30 * DAY), to, by: get('by'), cloud, page: (get('page') ?? '').trim().slice(0, 200), exact: get('exact') === '1' }
  if (url.pathname === '/stats/api/summary') return json(await summary(env, period))
  if (url.pathname === '/stats/api/paths') return json(await paths(env, period))
  if (url.pathname === '/stats/api/export') return json(await exportRows(env, period, number('after', 0)))
  if (url.pathname === '/stats/api/live') return json(await live(env, cloud))
  if (url.pathname === '/stats/map.txt') return new Response(worldMap, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'private, max-age=86400' } })
  return json({ error: 'not found' }, 404)
}

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url)
    if (pathname === '/api/v') return collect(request, env, ctx)
    if (pathname === '/stats' || pathname.startsWith('/stats/')) return dashboard(request, env)
    return fetch(request)   // a route matched more than this Worker handles: let the site answer
  },
}
