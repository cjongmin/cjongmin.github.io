// www.cjmin.me/<path>?<query> → https://cjmin.me/<path>?<query> (301).
export default {
  fetch(request) {
    const url = new URL(request.url)
    url.protocol = 'https:'
    url.hostname = 'cjmin.me'
    return Response.redirect(url.href, 301)
  },
}
