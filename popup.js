'use strict';

console.log("'Allo 'Allo! Popup");

$('#authorize').click(() => {
  chrome.runtime.sendMessage({ type: 'getAlbums' }, res => {
    console.log('sendMessage', res);
  });
});

$('#logout').click(() => {
  chrome.runtime.sendMessage({ type: 'logout' }, res => {
    console.log('logout', res);
  });
});

$('#createAlbum').click(() => {
  var albumName = prompt('Please enter new album name', 'New album');
  chrome.runtime.sendMessage({ type: 'createAlbum', data: albumName }, res => {
    console.log('createAlbum', res);
  });
});
