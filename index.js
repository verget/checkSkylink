
let checking = false;
let skylink = null;

init();

setInterval(() => {
  reinit();
  setTimeout(() => {
    // const status = {
    //   "environment": "A",
    //   "testTime": Date.now()
    // };
    let isWorking = false;
    const currentPeers = skylink.getPeersStream();
    console.log(currentPeers);
    if (currentPeers && Object.keys(currentPeers).length > 1) {
      const peerId = Object.keys(currentPeers)[0];
      skylink.getConnectionStatus((error, data) => {
        console.log(error, data);
        if (error) {
          // status.video = false;
          // status.audio = false;
          // status.errorMessage = error.connectionStats;
          isWorking = false;
        } else {
          // status.video = !!data.connectionStats[peerId].video.sending.bytes;
          // status.audio = !!data.connectionStats[peerId].audio.sending.bytes;
          isWorking = !!data.connectionStats[peerId].video.sending.bytes;
        }
        sendServerRequest(isWorking);
      })
    } else {
      // status.video = false;
      // status.audio = false;
      // status.errorMessage = 'no peers';

      isWorking = false;
      sendServerRequest(isWorking);
    }
  }, 10000);
}, 30000);

function init() {
  skylink = new Skylink();
  skylink.init({
    apiKey: '9aaa8a58-c193-4569-bdba-940e5e9f3d31',
    defaultRoom: 'testingRoom'
  }, function () {
    skylink.joinRoom({ audio: true, video: true });
  });

  skylink.on('incomingStream', function (peerId, stream, isSelf) {
    console.log('incomingStream', peerId, stream);
    if (isSelf) return;
    attachMediaStream(document.getElementById('remote'), stream);
  });

  skylink.on('mediaAccessSuccess', function (stream) {
    attachMediaStream(document.getElementById('local'), stream);
  });

  skylink.on('peerJoined', function (peerId, peerInfo, isSelf) {
    if (isSelf) return;
    console.log(peerId + ' joined!');
  });

  skylink.on('peerLeft', function (peerId, peerInfo, isSelf) {
    if (isSelf) return;
    console.log(peerId + ' left!');
    //checkPeerConnection();
  });

  skylink.on("channelClose", function () {
    console.log('channelClosed');
    //checkPeerConnection();
  });
}

function sendServerRequest(flag) {
  console.log("Send video is " + flag);
  if (flag) {
    prometheusAggregator('increment', 'videos_is_on', {  browser: 'chrome', feature: 'client_ip' }, 1);
  } else {
    prometheusAggregator('increment', 'videos_is_off', {  browser: 'chrome', feature: 'client_ip' }, 1);
  }
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
  if (skylink) {
    skylink.leaveRoom();
  }
}

function reconnect() {
  skylink.init({
    apiKey: '9aaa8a58-c193-4569-bdba-940e5e9f3d31',
    defaultRoom: 'testingRoom'
  }, function () {
    skylink.joinRoom({ audio: true, video: true })
  });
}

function reinit() {
  destroy();
  init();
}

function destroy() {
  if (skylink) {
    skylink.leaveRoom();
    skylink.off();
    skylink = null;
  }
}