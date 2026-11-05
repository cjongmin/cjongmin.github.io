-- Statistics for cjmin.me and world.cjmin.me. No IP addresses are stored.
-- visitor is a hash of (a random salt, the IP, the browser). The salt changes every day and the old
-- one is deleted, so it counts visitors within a day but cannot be traced back or linked across days.
CREATE TABLE IF NOT EXISTS events (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  ts      INTEGER NOT NULL,   -- milliseconds since the epoch
  type    TEXT    NOT NULL,   -- view | click
  page    TEXT    NOT NULL,   -- the address, with world.cjmin.me in front for that site; tracking parameters removed
  label   TEXT,               -- what was clicked, e.g. pub:<id>:Paper
  ref     TEXT,               -- where the visit came from: a group such as Google, a host name, or a utm_source
  country TEXT,
  region  TEXT,
  city    TEXT,
  lat     REAL,               -- Cloudflare's estimate from the IP, as given: often the centre of the city
  lon     REAL,
  org     TEXT,               -- the organization that owns the network, not the person's affiliation
  asn     INTEGER,
  kind    TEXT    NOT NULL,   -- academic | org | isp | cloud | unknown
  visitor TEXT    NOT NULL,
  vid     TEXT,               -- random id of one page view, so time on page can be added when it ends
  device  TEXT,
  browser TEXT,
  lang    TEXT,
  secs    INTEGER,
  depth   INTEGER,
  title       TEXT,           -- the page's title, or the clicked element's text
  ref_path    TEXT,           -- the referring page: host and path, never its query string
  campaign    TEXT,           -- utm_campaign or campaign in the link
  browser_ver TEXT,
  os          TEXT,
  os_ver      TEXT,
  width       INTEGER,        -- screen width
  postal      TEXT            -- Cloudflare's estimate, when it has one
);
CREATE INDEX IF NOT EXISTS events_ts ON events (ts);
CREATE INDEX IF NOT EXISTS events_vid ON events (vid);
CREATE TABLE IF NOT EXISTS salts (day TEXT PRIMARY KEY, salt TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS login_fails (hour TEXT PRIMARY KEY, n INTEGER NOT NULL);
