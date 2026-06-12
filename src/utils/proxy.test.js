const { parseProxyUrl, ProxyRotator } = require('./proxy');

describe('proxy helpers', () => {
  test('parses proxy url with credentials', () => {
    expect(parseProxyUrl('http://user:pass@proxy.local:8080')).toEqual({
      server: 'http://proxy.local:8080',
      username: 'user',
      password: 'pass'
    });
  });

  test('rotates proxies in round-robin order', () => {
    const rotator = new ProxyRotator([
      'http://one.local:8080',
      'http://two.local:8080'
    ]);

    expect(rotator.next().server).toBe('http://one.local:8080');
    expect(rotator.next().server).toBe('http://two.local:8080');
    expect(rotator.next().server).toBe('http://one.local:8080');
  });
});
