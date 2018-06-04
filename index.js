// let query = 'http://127.0.0.1:8888/small.mp4';
// fetch(query)
//   .then(function (response) {
//     console.log('answered');
//     console.log(response);
//     attachMediaStream(document.getElementById('remote'), response.body);
//   }).catch(err => {
//     console.error(err);
// });

let peers = [];
let checking = false;
let skylink = new Skylink();
skylink.init({
  apiKey: '9aaa8a58-c193-4569-bdba-940e5e9f3d31',
  defaultRoom: 'testRoom'
}, function () {
  skylink.joinRoom({ audio: true, video: true })
});
skylink.on('incomingStream', function (peerId, stream, isSelf) {
  if (isSelf) return;
  attachMediaStream(document.getElementById('remote'), stream);
});
skylink.on('mediaAccessSuccess', function (stream) {
  attachMediaStream(document.getElementById('local'), stream);
});

skylink.on('peerJoined', function (peerId, peerInfo, isSelf) {
  if (isSelf) return;
  console.log(peerId + ' joined!');
  peers.push(peerId);
  skylink.lockRoom();
});

skylink.on('peerLeft', function (peerId, peerInfo, isSelf) {
  if (isSelf) return;
  peers.splice(peers.indexOf(peerId), 1);
  console.log(peerId + ' left!');
  checkConnection();
});

skylink.on("channelClose", function () {
  console.log('channelClosed');
  checkConnection();
});

let skylink1 = new Skylink();
skylink1.init({
  apiKey: '9aaa8a58-c193-4569-bdba-940e5e9f3d31',
  defaultRoom: 'testRoom'
}, function () {
  //need to get custom video stream
  skylink1.joinRoom({ audio: true, video: true }, function() {
    skylink1.sendStream(stream, {
      audio: true,
      video: true
    }, function(error, success) {
      if (error) return;
      console.log("getUserMedia() Stream with video is now being sent to Peers");
    })
  })
});

function checkConnection() {
  // console.log('checkConnection');
  // let query = 'https://api.telegram.org/bot615169882:AAEqtWJky8612xj4UILeRepbAo_LRnRSH34/sendMessage?chat_id=@skylinkDoctorsmartTesting&text=';
  // let message = 'Miss me?';
  fetch(query + message + ' ' + new Date())
    .then(function (response) {
      return response.json();
    }).catch();
  if (peers.length || checking) {
    return;
  }
  checking = true;
  let joinAttempts = 0;
  const reconnectInterval = setInterval(() => {
    if (peers.length) {
      clearInterval(reconnectInterval);
      joinAttempts = 0;
      checking = false;
      return;
    }
    if (joinAttempts > 3) {
      let query = 'https://api.telegram.org/bot615169882:AAEqtWJky8612xj4UILeRepbAo_LRnRSH34/sendMessage?chat_id=@skylinkDoctorsmartTesting&text=';
      let message = 'Missing connection';
      fetch(query + message + ' ' + new Date())
        .then(function (response) {
          return response.json();
        }).catch();
    }
    joinAttempts++;
    reconnect();

  }, 10000);
}

function disconnect() {
  if (skylink1) {
    skylink1.leaveRoom();
  }
}

function reconnect() {
  if (peers.length) {
    return;
  }
  skylink.unlockRoom();
  skylink1.init({
    apiKey: '9aaa8a58-c193-4569-bdba-940e5e9f3d31',
    defaultRoom: 'testRoom'
  }, function () {
    skylink1.joinRoom({ audio: true, video: true })
  });
}

function destroy() {
  skylink1.leaveRoom();
  skylink1 = null;
}

// setInterval(() => {
//   if (!skylink._inRoom) {
//     if (confirm('Комната заблокирована другим пользователем. Обновить страницу?')) {
//       window.location.reload();
//     }
//   }
// }, 10000);