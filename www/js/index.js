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

    if(method === "repub") repub();
    if(method === "comment") comment();
    if(method === "subscribe") subscribe();
    if(method === "like") like();
    if(method === "dislike") dislike();
    if(method === "mute") toggleMute();
    if(method === "menu-close") exitMenu();
    if(method === "profile") profile();
    if(method === "viewprofile") viewprofile(btn.data("id"));
    if(method === "menu"){
        enterMenu();
    }
}
function profile(){
    storage.setItem("view.id", noku.uid);
    redirect("profile.html");
}
function viewprofile(id){
    storage.setItem("view.id", id);
    redirect("profile.html");
}
function toggleMute(parent){
    if(muted){
        $(parent + " .meme-video").prop('muted', false);
        $(parent + " .mute-control").css('background-image', 'url("../www/img/audio_on.png")');
        muted = false;
    } else {
        $(parent + " .meme-video").prop('muted', true);
        $(parent + " .mute-control").css('background-image', 'url("../www/img/audio_off.png")');
        muted = true;
    }
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
        effect: 'coverflow',
        zoom: {
            maxRatio: 5,
        }
    };

    if(device.platform === 'browser') {
        $(".swiper-container").append(
            '<div class="swiper-button-prev"></div>' +
            '<div class="swiper-button-next"></div>'
        );

        ops.navigation = {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        }
    }
    window.mySwipe = new Swiper('.swiper-container', ops);

    noku.getMemes(function(response, worked){
        if(!worked){
            createMeme(".swiper-wrapper", null);
            return;
        }
        var memes;
        try{
            let data = JSON.parse(response.data);
            memes = data.data;
        } catch (e){
            memes = [].push(null);
        }
        noku.memes = memes;
        for(var x = 0; x < memes.length; x++){
            createMeme(".swiper-wrapper", memes[x]);
        }

        loadComments(memes[0]);
        swiper.update();
    });

    let swiper = window.mySwipe;
    swiper.on('slideChangeTransitionStart', function () {
        stop_media(noku.memes[this.previousIndex]);
    });
    swiper.on('slideChangeTransitionEnd', function () {
        loadComments(noku.memes[this.realIndex]);
        play_media(noku.memes[this.realIndex]);
    });
}
function loadComments(meme){
    let id = meme.id;
    let com_data = noku.getCommentsByID(id);
    console.log(com_data);

    let comments = $('.comments');
    comments.html('<div class="block-label bg-op"><span class="icon-below span-icon"></span>Top Comments<span class="icon-below span-icon"></span></div>\n');
    for(var i = 0; i < com_data.length; i++){
        let com = create_comment(com_data[i], 0);
        if(com_data[i].replyTo === -1) comments.append(com);
        else {
            let parent = getCommentByID(com_data, com_data[i].replyTo);
            parent.author = noku.getUserData(parent.authorID).name;

            let parent_comment = $("#comment-" + com_data[i].replyTo + " .comment-replies");
            let parent_comment_header = $("#comment-" + com_data[i].replyTo + " .comment-head");
            parent_comment.append(create_comment(com_data[i], parent_comment_header.data("layer") + 1, parent));
        }
    }

    $(".comment-overlay").each(function () {
        $(this).fadeOut(0);
    });

    $(".comment-head").each(function () {
        let t = $(this);
        let pad = (t.data("layer") * 2) + 1;
        let wid = pad + 1;

        t.css("padding-left", t.data("layer") * 2 + "em");
        t.css("width", "calc(100% - " + t.data("layer") * 2 + "em)");

        let comment_body = t.parent().children(".comment-body");
        comment_body.css("padding-left", pad + "em");
        comment_body.css("width", "calc(100% - " + wid + "em)");

        let comment_vote = t.parent().children(".comment-vote");
        comment_vote.css("padding-left", pad + "em");
        comment_vote.css("width", "calc(100% - " + pad + "em)");
    })

    $(".comment-user").each(function () {
        let t = $(this);
        t.css("color", )
    })

    $(".comment-jump").click(function (){
        let id = $(this).data("comment");
        let comment = $("#comment-" + id);
        let overlay = $($("#comment-" + id + " .comment-overlay")[0]);
        let body = $("body, html");
        body.animate({ scrollTop: comment.position().top });
        body.promise().done(function() {
            overlay.fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200);
        });
    });
}

function getCommentByID(comments, id){
    for(var i = 0; i < comments.length; i++){
        if(comments[i].id === id) return comments[i];
    }

    return null;
}
function createNullMeme(container){
    let app = $(container);
    app.append(
        '<div class="swiper-slide meme-container" id="NULLMEME" data-memeid="NULLMEME">\n' +
        '  <div class="meme-op">\n' +
        '    <div class="float-left">\n' +
        '      <div class="op-pfp"></div>\n' +
        '      <div class="op-username">Noku Team</div>\n' +
        '    </div>\n' +
        '    <div class="float-right">\n' +
        '      <div class="btn btn-black mr-2 my-auto" data-command="none">No Touch!</div>\n' +
        '    </div>\n' +
        '  </div>\n' +
        '  <div class="meme-body swiper-zoom-container">\n' +
        '    <div class="container p-6">\n' +
        '      <h1>End of the line pal!</h1>\n' +
        '      <p>Unfortunately you have reached the end of the meme stream. Come back for more later.</p>\n' +
        '    </div>\n'+
        '  </div>\n' +
        '  <div class="meme-footer">\n' +
        '    <div class="float-left">\n' +
        '      <div class="meme-like-count"></div>\n' +
        '      <div class="meme-take btn ml-1" data-command="none"></div>\n' +
        '      <div class="meme-take btn" data-command="none"></div>\n' +
        '    </div>\n' +
        '    <div class="float-right">\n' +
        '       <div class="meme-take btn mr-1" data-command="none"></div>\n' +
        '       <div class="meme-take btn mr-2" data-command="none"></div>\n' +
        '       <div class="meme-take btn mr-2" data-command="none"></div>\n' +
        '    </div>\n' +
        '  </div>\n' +
        '</div>');
}
function createMeme(container, meme){
    if(meme == null) return createNullMeme(container);
    let id = meme.id;
    let hash = meme.hash;
    let author = meme.author;
    let app = $(container);
    var parent = '#' + hash;
    app.append(
        '<div class="swiper-slide meme-container" id="' + hash + '" data-memeid="' + id + '">\n' +
        '  <div class="meme-op">\n' +
        '    <div class="float-left">\n' +
        '      <div class="op-pfp"></div>\n' +
        '      <div class="op-username"></div>\n' +
        '    </div>\n' +
        '    <div class="float-right">\n' +
        '      <div class="btn btn-black mr-2 my-auto" data-command="viewprofile" data-id="' + author + '">View Profile</div>\n' +
        '    </div>\n' +
        '  </div>\n' +
        '  <div class="meme-body swiper-zoom-container">\n' +
        '  </div>\n' +
        '  <div class="meme-footer">\n' +
        '    <div class="float-left">\n' +
        '      <div class="meme-like-count"></div>\n' +
        '      <div class="meme-give btn ml-1" data-command="like"></div>\n' +
        '      <div class="meme-take btn" data-command="dislike"></div>\n' +
        '    </div>\n' +
        '    <div class="float-right">\n' +
        '       <div class="meme-repub btn mr-1" data-command="repub"></div>\n' +
        '       <div class="meme-share btn mr-2" data-command="share"></div>\n' +
        '       <div class="meme-comment btn mr-2" data-command="comment"></div>\n' +
        '    </div>\n' +
        '  </div>\n' +
        '</div>');

    var plat = device.platform;
    if(plat === "browser"){
    } else {
        $(parent + " .meme-container").addClass("center-vertical");
    }

    $(".btn").click(function (e){
        handleClick(e);
    });

    var url = noku.getCDNUrl();
    var authorID = meme.author;
    noku.getUserData(authorID, function(response, worked){
        if(!worked) return;
        var author;
        try {
            author = JSON.parse(response.data).data;
        } catch (e){
            author = {};
            author.valid = false;
        }

        var pfp = author.pfp;
        $(parent + " .op-pfp").html('<img class="pfp-image" src="' + url + pfp + '"  alt=""/>');
        let op_user = $(parent + " .op-username");
        op_user.html(author.username);
        op_user.css('color', "#" + author.color);
    });

    var xhttp = new XMLHttpRequest();
    xhttp.open('HEAD', url + meme.hash);
    xhttp.onreadystatechange = function () {
        if (this.readyState === this.DONE) {
            console.log(this.getAllResponseHeaders());
            var content = this.getResponseHeader("Content-Type");
            if(content == null) return;

            if(content.includes("image")) $(parent + " .meme-body").html('<img class="meme-image swiper-zoom-target" src="' + url + meme.hash + '" />');
            if(content.includes("video")){
                $(parent + " .meme-body").html('<video class="meme-image meme-video swiper-zoom-target" autoplay muted><source src="' + url + meme.hash +'" type="' + content + '"/></video><div class="mute-control btn" data-command="mute"></div>');
                $(parent + " .mute-control").click(function(){
                    toggleMute(parent);
                });
            }
            if(content.includes("audio")){
                $(parent + " .meme-body").html('<audio class="meme-image meme-audio" controls><source src="' + url + meme.hash +'" type="' + content + '"/></audio>');
                $(parent + " .mute-control").click(function(){
                    toggleMute(parent);
                });
            }

            $("img").one('load', function (){
                window.mySwipe.update();
            });

            $("video").one('load', function (){
                window.mySwipe.update();
            });
        }
    };
    xhttp.send();

    $(parent + " .meme-like-count").html(meme.likes - meme.dislikes);
    window.mySwipe.update();
}
function create_comment(comment, layer, parent) {
    let author = noku.getUserData(comment.authorID);
    let url = noku.getCDNUrl();

    var extra = "";
    if(parent != null){
        extra = '' +
            '<div class="comment-reply-to">Replying To: ' + parent.author + '</div>' +
            '<div class="comment-jump btn" data-comment="' + parent.id + '"></div>';
    }

    return  ''+
        '  <div class="comment' + (parent == null ? " comment-root" : "") + '" id="comment-' + comment.id + '">' +
        '    <div class="comment-content">' +
        '      <div class="comment-head" data-layer="' + layer + '">' +
        '        <div class="float-left">' +
        '          <div class="comment-pfp"><img class="pfp-image" src="'+url + author.pfp + '" /></div>' +
        '          <div class="comment-user" style="color:' + author.color + ';">' + author.name + '</div>' +
        '        </div>' +
        '        <div class="float-right">' +
        '          ' + extra +
        '        </div>' +
        '      </div>' +
        '      <div class="comment-body">' + comment.content + '</div>' +
        '      <div class="comment-vote">' +
        '        <div class="float-left">' +
        '          <div class="comment-like-count">' + (comment.likes - comment.dislikes) + '</div>' +
        '          <div class="comment-like btn" data-comment="' + comment.id + '"></div>' +
        '          <div class="comment-dislike btn" data-comment="' + comment.id + '"></div>' +
        '        </div>' +
        '        <div class="float-right">' +
        '          <div class="comment-reply btn" data-comment="' + comment.id + '"></div>' +
        '        </div>' +
        '      </div>' +
        '      <div class="comment-overlay"></div>' +
        '    </div>' +
        '    <div class="comment-replies"></div>' +
        '  </div>';
}