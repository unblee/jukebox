const { request } = require('../helper');

describe('features', () => {
  describe('index', () => {
    describe('GET /', () => {
      it('returns 200', () => request.get('/').expect(200));
    });
  });
});
