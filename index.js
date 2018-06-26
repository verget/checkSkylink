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
          isWorking = false;
        } else {
          isWorking = !!data.connectionStats[peerId].video.sending.bytes;
        }
        sendServerRequest(isWorking);
      })
    } else {
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
    const remote = document.getElementById('remote');
    if (remote.srcObject) {
      reattachMediaStream(document.getElementById('remote'), stream);
    } else {
      attachMediaStream(document.getElementById('remote'), stream);
    }
  });

  skylink.on('mediaAccessSuccess', function (stream) {
    const local = document.getElementById('local');
    if (local.srcObject) {
      reattachMediaStream(document.getElementById('local'), stream);
    } else {
      attachMediaStream(document.getElementById('local'), stream);
    }
  });

  skylink.on('peerJoined', function (peerId, peerInfo, isSelf) {
    if (isSelf) return;
    console.log(peerId + ' joined!');
  });

  skylink.on('peerLeft', function (peerId, peerInfo, isSelf) {
    if (isSelf) return;
    console.log(peerId + ' left!');
  });

  skylink.on("channelClose", function () {
    console.log('channelClosed');
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