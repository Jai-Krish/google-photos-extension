const client_id = 'ba01a18f2a0c4e9fa3130fa8a140ef48';
const redirect_uri = chrome.identity.getRedirectURL('oauth2');
var resolveAuthorize;
var selectedAlbum;
imageQueue = [];

function getImageName(url) {
  const regexMatch = /[\w-]+.(jpg|png|jpeg|gif)/g.exec(url);
  if (regexMatch && regexMatch[0]) {
    return regexMatch[0];
  }
  return null;
}

function saveImageToAlbum(info, tab) {
  const imageUrl = info.srcUrl;
  imageQueue.push(imageUrl);
  if (imageQueue.length > 1) {
    return;
  }
  saveImage(imageQueue[0]);
}

function saveImage(imageUrl) {
  var imageName = getImageName(imageUrl);
  fetch(imageUrl)
    .then(res => {
      if (!imageName) {
        const cd = res.headers.get('content-disposition');
        if (cd) {
          imageName = getImageName(cd);
        } else {
          imageName = `${+new Date()}.jpg`;
        }
      }
      return res.blob();
    })
    .then(blob => {
      return api(
        '/uploads',
        {
          method: 'POST',
          headers: {
            'Content-type': 'application/octet-stream',
            'X-Goog-Upload-File-Name': imageName,
            'X-Goog-Upload-Protocol': 'raw'
          },
          body: blob
        },
        true
      );
    })
    .then(
      res => {
        console.log('uploadToken', res);
        const body = {
          newMediaItems: [
            {
              description: 'New item',
              simpleMediaItem: {
                uploadToken: res
              }
            }
          ]
        };
        if (selectedAlbum) {
          body['albumId'] = selectedAlbum;
        }
        return api('/mediaItems:batchCreate', {
          method: 'POST',
          headers: {
            'Content-type': 'application/json'
          },
          body: JSON.stringify(body)
        });
      },
      err => {
        console.error('uploadToken', err);
      }
    )
    .then(res => {
      console.log('item added', res);
      imageQueue.shift();
      if (imageQueue.length > 0) {
        saveImage(imageQueue[0]);
      }
    });
}

chrome.contextMenus.removeAll();
chrome.contextMenus.create({
  title: 'Save image',
  contexts: ['image'],
  onclick: saveImageToAlbum
});

const authorize = () => {
  const scopes = [
    'https://www.googleapis.com/auth/photoslibrary.readonly',
    'https://www.googleapis.com/auth/photoslibrary.appendonly',
    'https://www.googleapis.com/auth/photoslibrary.readonly.appcreateddata',
    'https://www.googleapis.com/auth/photoslibrary',
    'https://www.googleapis.com/auth/photoslibrary.sharing'
  ];
  const params = {
    scope: scopes.join(' '),
    state: 'state_parameter_passthrough_value',
    redirect_uri: 'https://photos-extension.firebaseapp.com',
    response_type: 'token',
    client_id:
      '812304807244-4a5sl466kl07ach2ts6ct45pk7i6na1l.apps.googleusercontent.com'
  };
  const encodedParams = Object.keys(params)
    .map(res => `${res}=${encodeURIComponent(params[res])}`)
    .join('&');
  return new Promise((resolve, reject) => {
    resolveAuthorize = resolve;
    chrome.tabs.create({
      url: `https://accounts.google.com/o/oauth2/v2/auth?${encodedParams}`
    });
  });
};

const getToken = () =>
  new Promise((resolve, reject) => {
    chrome.storage.local.get('accessToken', result => {
      resolve(result.accessToken || authorize());
    });
  });

const api = async (url, options = {}, isText) => {
  const accessToken = await getToken();

  options.headers = {
    ...options.headers,
    Authorization: 'Bearer ' + accessToken
  };

  const response = await fetch(
    'https://photoslibrary.googleapis.com/v1' + url,
    options
  );

  if (isText) {
    return response.text();
  } else {
    const data = await response.json();
    console.log('response.json', data);

    if (data.error) {
      console.error(data.error);

      switch (data.error.code) {
        case 401: {
          console.log('error', 401);
          return new Promise((resolve, reject) => {
            chrome.storage.local.remove('accessToken', () => {
              resolve(api(url, options)); // retry
            });
          });
        }
      }
      return;
    }
    return data;
  }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('onMessage', request, sender, sendResponse);
  if (request.type) {
    switch (request.type) {
      case 'accessToken':
        setAccessToken(sendResponse, request.data);
        break;
      case 'getAlbums':
        getAlbums(sendResponse);
        break;
      case 'createAlbum':
        createAlbum(sendResponse, request.data);
        break;
      case 'logout':
        logout(sendResponse);
        break;
    }
  }
  return true;
});

function getAlbums(sendResponse) {
  api(`/albums`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }).then(res => {
    console.log('getAlbums', res);
    sendResponse(res);
  });
}

function logout(sendResponse) {
  chrome.storage.local.remove('accessToken', () => {
    sendResponse('Logged out');
  });
}

function setAccessToken(sendResponse, token) {
  chrome.storage.local.set({ accessToken: token }, () => {
    sendResponse(true);
    resolveAuthorize(token);
  });
}

function createAlbum(sendResponse, name) {
  api(`/albums`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      album: {
        title: name
      }
    })
  }).then(res => {
    console.log('createAlbum', res);
    sendResponse(res);
  });
}
