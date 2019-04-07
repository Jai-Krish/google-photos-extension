const params = location.hash
  .substr(1)
  .split('&')
  .map(res => res.split('='))
  .reduce((prev, next) => {
    prev[next[0]] = next[1];
    return prev;
  }, {});
chrome.runtime.sendMessage(
  { type: 'accessToken', data: params['access_token'] },
  res => {
    console.log('sendMessage authToken', res);
  }
);
