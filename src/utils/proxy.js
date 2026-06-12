const stripAuthFromProxy = proxyUrl => {
  const url = new URL(proxyUrl);
  url.username = '';
  url.password = '';
  return url.toString().replace(/\/$/, '');
};

const parseProxyUrl = proxyUrl => {
  if (!proxyUrl) return null;

  const url = new URL(proxyUrl);
  return {
    server: stripAuthFromProxy(proxyUrl),
    username: decodeURIComponent(url.username || ''),
    password: decodeURIComponent(url.password || '')
  };
};

class ProxyRotator {
  constructor(proxyUrls = []) {
    this.proxies = proxyUrls.map(parseProxyUrl).filter(Boolean);
    this.index = 0;
  }

  next() {
    if (!this.proxies.length) return null;

    const proxy = this.proxies[this.index % this.proxies.length];
    this.index += 1;
    return proxy;
  }
}

module.exports = {
  parseProxyUrl,
  ProxyRotator
};
