import nock from 'nock';

// Enable debug for nock by setting the debug variable
// i.e., DEBUG=nock.* yarn test

const mockGraphQLResponse = (
  url: string,
  assertRequestHeaders?: Record<string, string | undefined>,
  response: Object = {},
  responseCode: number = 200,
) => {
  return nock(url)
    .post('')
    .reply(responseCode, function () {
      for (const key in assertRequestHeaders) {
        if (assertRequestHeaders[key] === undefined) {
          expect(this.req.headers?.[key]).toBeUndefined();
        } else {
          expect(this.req.headers?.[key][0]).toEqual(assertRequestHeaders[key]);
        }
      }
      return { data: response };
    });
};

export { mockGraphQLResponse };
