var webOS = window['webOS'];
var webOSDev = window['webOSDev'];

console.log('userAgent', navigator.userAgent);
console.log('webOS', webOS, webOS.libVersion);
console.log('webOSDev', webOSDev);

var config = {
  drmType: 'widevine',
  licenseServer: 'https://orange4glace.info/widevine-only',
  manifestUri: 'https://orange4glace.info/widevine-only/earth.mpd'
}

// var config = {
//   drmType: 'playready',
//   licenseServer: 'https://orange4glace.info/playready-only',
//   manifestUri: 'https://orange4glace.info/playready-only/earth.mpd'
// }

console.log('config', config);
document.getElementById('title').innerText = '[' + config.drmType + '] ' + config.manifestUri

var playready_msg = '<?xml version="1.0" encoding="utf-8"?>' +
  '<PlayReadyInitiator xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols/">' +
  '<LicenseServerUriOverride>' +
  '<LA_URL>' + config.licenseServer + '</LA_URL>' +
  '</LicenseServerUriOverride>' +
  '</PlayReadyInitiator>';

var widevine_msg = '<?xml version="1.0" encoding="utf-8"?>' +
  '<WidevineCredentialsInfo xmlns="http://www.smarttv-alliance.org/DRM/widevine/2012/protocols/">' +
  '<ContentURL>' + config.manifestUri + '</ContentURL>' +
  '<DeviceID></DeviceID>' +
  '<StreamID></StreamID>' +
  '<ClientIP></ClientIP>' +
  '<DRMServerURL>' + config.licenseServer + '</DRMServerURL>' +
  '<DRMAckServerURL></DRMAckServerURL>' +
  '<DRMHeartBeatURL></DRMHeartBeatURL>' +
  '<DRMHeartBeatPeriod>0</DRMHeartBeatPeriod>' +
  '<UserData></UserData>' +
  '<Portal></Portal>' +
  '<StoreFront></StoreFront>' +
  '<BandwidthCheckURL></BandwidthCheckURL>' +
  '<BandwidthCheckInterval></BandwidthCheckInterval>' +
  '</WidevineCredentialsInfo >';

/** webOSDev.drmAgent() */
window.addEventListener('unload', function () {
  unloadDrm();
});

var drmAgent;
switch(config.drmType) {
  case 'widevine':
    drmAgent = webOSDev.drmAgent(webOSDev.DRM.Type.WIDEVINE);
    break;
  case 'playready':
    drmAgent = webOSDev.drmAgent(webOSDev.DRM.Type.PLAYREADY);
    break;
  default:
}

// To start video play
isDrmLoaded();

function isDrmLoaded() {
  drmAgent.isLoaded({
    onSuccess: function(res) {
      console.log('isDrmLoaded', res);
      if (res.loadStatus !== true) {
        loadDrm();
      } else {
        sendDrmMessage();
      }
    },
    onFailure: function(res) {
      // API calling error
      console.error(res)
    }
  });
}

function loadDrm() {
  drmAgent.load({
    onSuccess: function(res) {
      console.log('loadDrm', res);
      sendDrmMessage();
    },
    onFailure: function(res) {
      // API calling error
      console.error('loadDrm', res);
    }
  });
}

function unloadDrm() {
  drmAgent.unload({
    onSuccess: function(res) {
      // do something
      console.log('unloadDrm', res);
    },
    onFailure: function(res) {
      // API calling error
      console.error('unloadDrm', res);
    }
  });
}

function getRightsError() {
  drmAgent.getRightsError({
    onSuccess: function(res) {
      // playready only
      // handle error
      console.log('getRightsError', res);
    },
    onFailure: function (res) {
      // API calling error
      console.error('getRightsError', res);
    }
  });
}

function sendDrmMessage() {
  var msg;
  switch (config.drmType) {
    case 'widevine':
      msg = widevine_msg;
      break;
    case 'playready':
      msg = playready_msg;
      break;
    default:
  }

  console.log('msg', msg);

  drmAgent.sendDrmMessage({
    msg: msg,
    onSuccess: function(res) {
      console.log('sendDrmMessage', res);
      getRightsError();
      loadPlayer();
    },
    onFailure: function(res) {
      // API calling error
      console.error('sendDrmMessage', res);
    }
  });
}

function loadPlayer() {
  var player = document.getElementById('video');
  console.log('loadPlayer', player);

  player.addEventListener('error', function(e) {
    console.error('error', e);
  });

  player.addEventListener('stalled', function(e) {
    console.log('stalled', e);
  });

  var mediaTransportType = config.drmType === 'widevine' ? 'WIDEVINE' : 'URI';
  var options = {
    mediaTransportType: mediaTransportType,
    option: {
      drm: {
        type: drmAgent.getDrmType(),
        clientId: drmAgent.getClientId()
      }
    }
  };
  console.log('options', options);
  var mediaOption = encodeURI(JSON.stringify(options));
  var source = document.createElement('source');
  source.setAttribute('src', config.manifestUri);
  source.setAttribute('type', 'application/dash+xml;mediaOption=' + mediaOption);
  player.appendChild(source);
  player.load();
}
