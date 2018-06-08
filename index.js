
let checking = false;
let skylinkA = null;

init();

setInterval(() => {
  reinit();
  setTimeout(() => {
    // const status = {
    //   "environment": "A",
    //   "testTime": Date.now()
    // };
    let isWorking = false;
    const currentPeers = skylinkA.getPeersStream();
    console.log(currentPeers);
    if (currentPeers && Object.keys(currentPeers).length > 1) {
      const peerId = Object.keys(currentPeers)[0];
      skylinkA.getConnectionStatus((error, data) => {
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
  skylinkA = new Skylink();
  skylinkA.init({
    apiKey: '9aaa8a58-c193-4569-bdba-940e5e9f3d31',
    defaultRoom: 'testingRoom'
  }, function () {
    skylinkA.joinRoom({ audio: true, video: true });
  });

  skylinkA.on('incomingStream', function (peerId, stream, isSelf) {
    console.log('incomingStream', peerId, stream);
    if (isSelf) return;
    attachMediaStream(document.getElementById('remote'), stream);
  });

  skylinkA.on('mediaAccessSuccess', function (stream) {
    attachMediaStream(document.getElementById('local'), stream);
  });

  skylinkA.on('peerJoined', function (peerId, peerInfo, isSelf) {
    if (isSelf) return;
    console.log(peerId + ' joined!');
  });

  skylinkA.on('peerLeft', function (peerId, peerInfo, isSelf) {
    if (isSelf) return;
    console.log(peerId + ' left!');
    //checkPeerConnection();
  });

  skylinkA.on("channelClose", function () {
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

  
  // const binaryData = stringToBinary(JSON.stringify(data));
  // console.log(binaryData);
  // fetch('http://52.15.204.247:9091/metrics/job/skylink/instance/frontend', {
  //   method: 'POST',
  //   body: binaryData
  // }).then(function (response) {
  //   return response.json();
  // }).catch(err => {
  //   console.error(err);
  // });
  // return false;
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
  if (skylinkA) {
    skylinkA.leaveRoom();
  }
}

function reconnect() {
  skylinkA.init({
    apiKey: '9aaa8a58-c193-4569-bdba-940e5e9f3d31',
    defaultRoom: 'testingRoom'
  }, function () {
    skylinkA.joinRoom({ audio: true, video: true })
  });
}

function reinit() {
  destroy();
  init();
}

function destroy() {
  if (skylinkA) {
    skylinkA.leaveRoom();
    skylinkA.off();
    skylinkA = null;
  }
}