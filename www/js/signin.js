document.addEventListener('deviceready', onDeviceReady, false);
let noku = new Noku();
let storage = window.localStorage;

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);

    noku.init();

    $(".btn").click(function (e){
        handleClick(e);
    });
}