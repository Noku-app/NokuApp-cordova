/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready

document.addEventListener('deviceready', onDeviceReady, false);
var muted = true;
let noku = new Noku();
let storage = window.localStorage;

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);

    noku.init();
    noku.setCredentials(storage.getItem("auth_token"), storage.getItem("uid"));

    if(device.platform !== "browser"){
        $("#upload").prepend('<div class="upload-option">\n' +
            '                                    <div class="btn icon-image" data-command="upload-image"></div>\n' +
            '                                    <div class="upload-label">Upload Image</div>\n' +
            '                                </div>\n' +
            '                                <div class="upload-option">\n' +
            '                                    <div class="btn icon-video" data-command="upload-video"></div>\n' +
            '                                    <div class="upload-label">Upload Video</div>\n' +
            '                                </div>\n' +
            '                                <div class="upload-option">\n' +
            '                                    <div class="btn icon-camera" data-command="take-image"></div>\n' +
            '                                    <div class="upload-label">Take Picture</div>\n' +
            '                                </div>');
    }

    $(".btn").click(function (e){
        handleClick(e);
    });

    getValue("em-measure");

    noku.testToken(handleTokenCheck)
}
function handleTokenCheck(response, worked){
    var data;
    try {
        data = JSON.parse(response.data);
    } catch (e){
        data = {};
        data.valid = false;
    }

    if(data.valid === true){
        setup();
    } else {
        alert(JSON.stringify(response));
        redirect("signin.html");
    }
}

function redirect(page){
    $("body").fadeOut(100, function(){
        window.location.href = page;
    });
}
var em; function getValue(id){
    var div = document.getElementById(id);
    div.style.height = '1em';
    return ( em = div.offsetHeight );
}

function handleClick(e){
    var btn = $(e.target);
    var method = btn.data("command");
    let uid = storage.getItem("view.id");

    //if(method === "upload") upload();
    if(method === "memes") window.mySwipe.slideTo(1, 100, null);
    if(method === "settings") window.mySwipe.slideTo(3, 100, null);
    if(method === "upload") window.mySwipe.slideTo(2, 100, null);
    if(method === "upload-image") {
        if(uid === noku.uid) uploadImage();
    }
    if(method === "upload-video") {
        if(uid === noku.uid) uploadVideo();
    }
    if(method === "take-image") {
        if(uid === noku.uid) takeImage();
    }
    if(method === "upload-link") {
        if(uid === noku.uid){
            navigator.notification.prompt("Paste or type the url you want to share.", function (result){
                if(result.buttonIndex === 1){
                    uploadURL(result.input1);
                }
            }, "Upload from URL", ['Okay', 'Cancel'], "");
        }
    }

    if(method === "setting-pfp"){
        navigator.notification.prompt("Press the share button on the meme you want to set as your pfp and paste the link below. Only images are supported.", function (result){
            if(result.buttonIndex === 1){
                settingPFP(result.input1);
            }
        }, "PFP from Link", ['Okay', 'Cancel'], "");
    }

    if(method === "profile") profile();
    if(method === "submissions") redirect("submissions.html");
    if(method === "dank") redirect("index.html");
    if(method === "menu") enterMenu();
    if(method === "menu-close") exitMenu();
}

/********************************
 * Settings Functions
 ********************************/

function settingPFP(link){
    noku.settingPFP(link, function(response, worked){
        console.log(JSON.stringify(response));
        if(!worked) return;

        var data;
        try{
            data = JSON.parse(response.data);
        } catch (e){
            console.log(e);
            data = {};
            data.error = true;
        }
        
        if(data.error === true){
            navigator.notification.alert(data.data.message, null, "An Error Occurred", "Okay");
            return;
        }
        window.location.reload(true);
    });
}

/********************************
 * Upload Functions
 ********************************/

var resultMedias=[];
var imgs = document.getElementsByName('imgView');
var args = {
    'selectMode': 101, //101=picker image and video , 100=image , 102=video
    'maxSelectCount': 1, //default 40 (Optional)
    'maxSelectSize': 15728640, //188743680=180M (Optional)
};

function uploadImage(){
    args.selectMode = 100;
    MediaPicker.getMedias(args, function(medias) {
        resultMedias = medias;
        getThumbnail(medias, true);
    }, function(e) { console.log(e) })
}

function uploadVideo(){
    args.selectMode = 102;
    MediaPicker.getMedias(args, function(medias) {
        resultMedias = medias;
        getThumbnail(medias, false);
    }, function(e) { console.log(e) })
}

function uploadURL(url){
    let expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
    let regex = new RegExp(expression);

    if (url.match(regex)) {
        let progress = $(".loading-label");
        loadingUI();
        progress.html("Checking URL Contents...")
        noku.uploadUrlMeme(url, function(response, worked){
            if(!worked) return;
            var data;
            try {
                data = JSON.parse(response.data);
                if(data.error === true){
                    navigator.notification.alert(data.data.message, function(){}, "Error uploading URL", "Okay");
                    hideLoadingUI();
                    return;
                }
                data = data.data;
            } catch (e) {
                data = {};
                data.id = 0;
                data.hash = "";
            }

            hideLoadingUI();
            storage.setItem("meme.id", data.id);
            redirect("meme.html");
        });
    } else {
        navigator.notification.alert("URL is invalid.", function(){}, "Error uploading URL", "Okay");
    }
}

function takeImage(){
    var cameraOptions = {
        quality: 50,
        mediaType: Camera.MediaType.PICTURE
    };
    MediaPicker.takePhoto(cameraOptions,function(media) {
        media.index = 0;
        resultMedias.push(media);
        getThumbnail(resultMedias, true);
    }, function(e) { console.log(e) });
}

function takeVideo(){
    var cameraOptions = {
        quality: 50,
        mediaType: Camera.MediaType.VIDEO
    };
    MediaPicker.takePhoto(cameraOptions,function(media) {
        media.index = 0;
        resultMedias.push(media);
        getThumbnail(resultMedias, false);
    }, function(e) { console.log(e) });
}

function getFileContentAsBase64(path){
    path = "file://" + path;

    window.resolveLocalFileSystemURL(path, gotFile, fail);

    function fail(e) {
        hideLoadingUI();
        alert('Cannot find the requested file.' + e);
    }

    function gotFile(fileEntry) {
        let progress = $(".loading-label");

        fileEntry.file(function(file) {
            var reader = new FileReader();
            reader.onloadend = function(e) {
                let l = $(".loading-label");
                l.html("Done Converting.")
                let index = this.result.indexOf('base64,');
                progress.html("Uploading...");
                noku.uploadMeme(this.result.substring(index + 7), function (response, worked) {
                    progress.html("Taking you to your meme...");
                    if (!worked) {
                        console.log(response);
                        hideLoadingUI();
                        return;
                    }
                    var data;
                    try {
                        data = JSON.parse(response.data);
                        data = data.data;
                    } catch (e) {
                        data = {};
                        data.id = 0;
                        data.hash = "";
                    }

                    hideLoadingUI();
                    if (data.id === 0) {
                        redirect("index.html");
                    } else {
                        storage.setItem("meme.id", data.id);
                        redirect("meme.html");
                    }
                });
            };
            reader.readAsDataURL(file);
        }, function (e){
            hideLoadingUI();
            alert(JSON.stringify(e));
        });
    }
}

function getThumbnail(medias, compress) {
    let progress = $(".loading-label");
    for (var i = 0; i < medias.length; i++) {
        loadingUI(); //show loading ui
        medias[i].quality = 100;
        if(compress){
            medias[i].quality = 50;
        }
        progress.html("Compressing...");
        MediaPicker.compressImage(medias[i], function(compressData) {
            progress.html("Converting...");
            console.log(compressData.path);
            send(compressData.path);
        }, function(e) { console.log(e) });
    }
}

function send(path){
    getFileContentAsBase64(path);
}

function loadingUI(){
    $(".loading-ui").addClass("show");
}

function hideLoadingUI(){
    $(".loading-ui").removeClass("show");
}

function deleteFile(path){
    window.resolveLocalFileSystemURL(path, function (fileEntry) {
            fileEntry.remove(
                function () {
                    console.log('Cleaned up compressed file.');
                },
                function (error) {
                    alert('Unable to remove file.');
                }
            );
        }
    );
}

/********************************
 * Profile Functions
 ********************************/
function profile(){
    storage.setItem("view.id", noku.uid);
    redirect("profile.html");
}

function enterMenu() {
    $('#sidemenu').css({'display': 'block'}).addClass('animated slideInRight');
    $('#overlay').fadeIn();

    let close = $('#menu-close');
    close.removeClass("hide");
}
function exitMenu() {
    let side = $('#sidemenu');
    side.addClass('animated slideOutRight');
    side.css({'display': 'none'});

    $('#overlay').fadeOut();
    let close = $('#menu-close');
    close.addClass("hide");
}

function setup(){
    $("body").fadeIn(100, function(){});

    var ops = {
        direction: 'horizontal',
        autoHeight: true,
        loop: true,
    };
    window.mySwipe = new Swiper('.swiper-container', ops);
    let uid = storage.getItem("view.id");

    if(uid !== noku.uid) $(".profile-actions").css("display", "none");

    noku.getUserData(uid, function (author) {
        let url = noku.getCDNUrl();
        let me = (uid === noku.uid);
        let pfp = author.pfp;
        let bg = author.bg;
        let title = author.title;
        var t = author.created.split(/[- :]/);
        let date = new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]));;

        if(!me){
            window.mySwipe.allowSlideNext = false;
            window.mySwipe.allowSlidePrev = false;
        }

        var days = getDaysAgo(date);
        days += days == 1 ? " Day" : " Days";
        $(".profile-cover").html(
            '<img class="profile-cover-img" src="' + url + bg + '" alt="">' +
            '<div class="profile-shadow"></div>' +
            '<div class="profile-pfp"></div>' +
            '<div class="profile-name"></div>' +
            '<div class="profile-title">' + title + '</div>' +
            '<div class="profile-created">' + days + '</div>' +
            (me ? '<div class="profile-settings" data-command="settings"></div>' : '')
        );

        $(".profile-pfp").html('<img class="pfp-image" src="' + url + pfp + '"  alt=""/>');
        let op_user = $(".profile-name");
        op_user.html(author.username);
        $("#profile-name").html(author.username);
        op_user.css('color', "#" + author.color);
    });

    noku.getAllLikes(uid, function(response, worked){
        if(!worked) return;
        var data;
        try {
            data = JSON.parse(response.data).data;
        } catch (e){
            data = {};
            data.likes = 0;
            data.dislikes = 0;
        }

        $(".profile-likes > .value").html(data.likes - data.dislikes);
    });

    noku.getAllMemes(uid, function(response, worked){
        if(!worked) return;
        var memes;
        try {
            memes = JSON.parse(response.data).data;
        } catch (e){
            memes = [];
        }
        $(".profile-memes > .value").html(memes.length);
        populateMemes(memes);
    });

    noku.getAllSubscribers(uid, function(response, worked){
        if(!worked) return;
        var subs;
        try {
            subs = JSON.parse(response.data).data;
        } catch (e){
            subs = [];
        }
        $(".profile-subs > .value").html(subs.length);
    });
}
function populateMemes(memes){
    let container = $('#memes');
    container.html("");

    for(var x = 0; x < memes.length; x++){
        inflateMeme(memes[x], container);
    }
}

function inflateMeme(meme, container){
    let dislikes = meme.dislikes;
    let likes = meme.likes;
    let hash = meme.hash;
    let id = meme.id;

    container.append('<div class="meme-sm" data-id="'+id+'" data-memeid="'+id+'" id="meme-'+id+'">\n' +
        '<div class="sm-likes">'+(likes - dislikes)+' Shekels</div>\n' +
        '</div>');

    noku.getMimeType(hash, function (response, worked){
        if(!worked) return;
        var mime;
        try {
            mime = JSON.parse(response.data).data;
        } catch (e){
            mime = "image/jpg";
        }
        console.log(response);

        var content = $("#meme-" + id);
        if(mime.startsWith("image")){
            content.prepend('<img class="sm-content" src="'+noku.getCDNUrl() + hash +'" alt="meme">');
        } else if(mime.startsWith("video")){
            content.prepend('<video class="sm-content" src="'+noku.getCDNUrl() + hash +'"></video>');
        } else if(mime.startsWith("embed")){
            noku.getContent(noku.getCDNUrl() + meme.hash, function(response, worked){
                if(!worked) return;
                if(device.platform === "browser") {
                    content.prepend(response.data);
                } else {
                    content.prepend('<iframe class="meme-embed" src="'+noku.getCDNUrl() + meme.hash+'" />');
                }
            });
        }

        $(".meme-sm").on('click', function (e){
            let target = $(e.target).closest(".meme-sm");
            let id = target.data("memeid");
            storage.setItem("meme.id", id);
            redirect("meme.html");
        });

        $(".sm-content").onload(function(){
            if(window.mySwipe != null){
                window.mySwipe.update();
            }
        });
    });
}