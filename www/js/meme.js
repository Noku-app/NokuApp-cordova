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

    //if(method === "upload") upload();
    if(method === "profile") profile();
    if(method === "menu-close") exitMenu();
    if(method === "memes") window.mySwipe.slideTo(0, 100, null);
    if(method === "upload") window.mySwipe.slideTo(1, 100, null);
    if(method === "dank") redirect("index.html");
    if(method === "menu"){
        enterMenu();
    }
}

function profile(id){
    storage.setItem("view.id", id);
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

    noku.getUserData(noku.uid, function(response, worked){
        if(!worked) return;
        var author;
        try {
            author = JSON.parse(response.data).data;
        } catch (e){
            author = {};
            author.valid = false;
        }

        let url = noku.getCDNUrl();
        let pfp = author.pfp;
        let bg = author.bg;
        let title = author.title;
        var t = author.created.split(/[- :]/);
        let date = new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]));;

        var days = getDaysAgo(date);
        days += days == 1 ? " Day" : " Days";
        $(".profile-cover").html(
            '<img class="profile-cover-img" src="' + url + bg + '" alt="">' +
            '<div class="profile-pfp"></div>' +
            '<div class="profile-name"></div>' +
            '<div class="profile-title">' + title + '</div>' +
            '<div class="profile-created">' + days + '</div>'
        );

        $(".profile-pfp").html('<img class="pfp-image" src="' + url + pfp + '"  alt=""/>');
        let op_user = $(".profile-name");
        op_user.html(author.username);
        $("#profile-name").html(author.username);
        op_user.css('color', "#" + author.color);
    });

    noku.getAllLikes(noku.uid, function(response, worked){
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

    noku.getAllMemes(noku.uid, function(response, worked){
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

    noku.getAllSubscribers(noku.uid, function(response, worked){
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

    noku.getMimeType(hash, function (response, worked){
        if(!worked) return;
        var mime;
        try {
            mime = JSON.parse(response.data).data;
        } catch (e){
            mime = "image/jpg";
        }

        var content;
        if(mime.startsWith("image")){
            content = '<img class="sm-content" src="'+noku.getCDNUrl() + hash +'" alt="meme">\n';
        } else if(mime.startsWith("video")){
            content = '<video class="sm-content" src="'+noku.getCDNUrl() + hash +'"></video>\n';
        }

        container.append('<div class="meme-sm" data-id="'+id+'" id="meme-'+id+'">\n' +
            content +
            '<div class="sm-likes">'+(likes - dislikes)+' Shekels</div>\n' +
            '</div>');
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