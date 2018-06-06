
let checking = false;
let skylinkB = null;
init();
setInterval(() => {
  reinit();
  setTimeout(() => {
    const status = {
      "environment": "B",
      "testTime": Date.now()
    };
    const currentPeers = skylinkB.getPeersStream();
    console.log(currentPeers);
    if (currentPeers && Object.keys(currentPeers).length > 1) {
      //success request
      const peerId = Object.keys(currentPeers)[0];
      skylinkB.getConnectionStatus((error, data) => {
        console.log(error, data);
        if (error) {
          status.video = false;
          status.audio = false;
          status.errorMessage = error.connectionStats;
        } else {
          status.video = !!data.connectionStats[peerId].video.sending.bytes;
          status.audio = !!data.connectionStats[peerId].audio.sending.bytes;
        }
        sendServerRequest(status);
      })
    } else {
      status.video = false;
      status.audio = false;
      status.errorMessage = 'no peers';
      sendServerRequest(status);
    }
  }, 3000)
}, 30000);

function init() {
  skylinkB = new Skylink();
  skylinkB.init({
    apiKey: '9aaa8a58-c193-4569-bdba-940e5e9f3d31',
    defaultRoom: 'testingRoom'
  }, function () {
    skylinkB.joinRoom({ audio: true, video: true });
  });

  skylinkB.on('incomingStream', function (peerId, stream, isSelf) {
    console.log('incomingStream', peerId, stream);
    if (isSelf) return;
    attachMediaStream(document.getElementById('remote'), stream);
  });

  skylinkB.on('mediaAccessSuccess', function (stream) {
    attachMediaStream(document.getElementById('local'), stream);
  });

  skylinkB.on('peerJoined', function (peerId, peerInfo, isSelf) {
    if (isSelf) return;
    console.log(peerId + ' joined!');
  });

  skylinkB.on('peerLeft', function (peerId, peerInfo, isSelf) {
    if (isSelf) return;
    console.log(peerId + ' left!');
    //checkPeerConnection();
  });

  skylinkB.on("channelClose", function () {
    console.log('channelClosed');
    //checkPeerConnection();
  });
}

function sendServerRequest(data) {
  const binaryData = stringToBinary(JSON.stringify(data));
  console.log(binaryData);
  fetch('http://52.15.204.247:9091/metrics/job/skylink/instance/frontend', {
    method: 'POST',
    body: binaryData
  }).then(function (response) {
    return response.json();
  }).catch(err => {
    console.error(err);
  });
  return false;
}

function stringToBinary(str) {
  return new Uint8Array(str.split('')
    .map(c => c.charCodeAt(0))).buffer;
}

function sendTGMessage(message) {
  let query = 'https://api.telegram.org/bot615169882:AAEqtWJky8612xj4UILeRepbAo_LRnRSH34/sendMessage?chat_id=@skylinkDoctorsmartTesting&text=';
  fetch(query + message + ' ' + new Date())
    .then(function (response) {
      return response.json();
    }).catch(err => {
    console.error(err);
  });
}

function disconnect() {
  if (skylinkB) {
    skylinkB.leaveRoom();
  }
}

function reconnect() {
  skylinkB.init({
    apiKey: '9aaa8a58-c193-4569-bdba-940e5e9f3d31',
    defaultRoom: 'testingRoom'
  }, function () {
    skylinkB.joinRoom({ audio: true, video: true })
  });
}

function reinit() {
  destroy();
  init();
}

function destroy() {
  skylinkB.leaveRoom();
  skylinkB.off();
  skylinkB = null;
}