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
var cb;

var comment_posted = false;

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
function handleClick(e){
    var btn = $(e.target);
    var method = btn.data("command");
    let parent = btn.closest(".swiper-slide");

    //if(method === "upload") upload();
    if(method === "mute") toggleMute();
    if(method === "like") like(parent, noku);
    if(method === "dislike") dislike(parent, noku);

    if(method === "profile") profile();
    if(method === "submissions") redirect("submissions.html");
    if(method === "dank") redirect("index.html");
    if(method === "menu-close") exitMenu();
    if(method === "menu") enterMenu();

    if(method === "comment"){
        let box = $(".post-comment");
        box.show();
        box.data('replyTo', -1);
        box.data('meme', parent.data('memeid'));
        comment_posted = false;
    }
    if(method === "postcomment"){
        if(comment_posted) return;

        comment_posted = true;
        let box = $(".post-comment");
        let replyTo = box.data('replyTo');
        let meme = box.data('meme');
        let content = $(".content").val();
        noku.postComment(meme, content, replyTo, function (response, worked){
            var data;
            try {
                data = JSON.parse(response.data);
            } catch (e){
                data = {};
                data.valid = false;
                alert(JSON.stringify(response));
            }
            create_posted_comment({
                id: data.data.id,
                likes: 0,
                dislikes: 0,
                content: content
            }, 0, null, $('.comments'));
        });
        box.hide();
    }
    if(method === "viewprofile") viewprofile(btn.data("id"));
}

function viewprofile(id){
    storage.setItem("view.id", id);
    redirect("profile.html");
}

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
    cb = new ClipboardJS(".meme-share");
    $("body").fadeIn(100, function(){});
    let id = getMemeID();
    noku.getMemeData(id, function (response, worked){
        if(!worked) return;

        var meme;
        try {
            meme = JSON.parse(response.data);
            if(meme.error === true) {
                console.log(meme.data);
                meme = null;
            }
            else meme = meme.data;

        } catch (e){
            console.log(e);
            console.log(response);
            meme = null;
        }
        console.log(meme);

        createMeme(".meme-content", meme);
        loadComments(meme);
    });
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
function createMeme(container, meme) {
    if (meme == null) return createNullMeme(container);
    let id = meme.id;
    let hash = meme.hash;
    let liked = meme.liked;
    let disliked = meme.disliked;
    let author = meme.author;
    let app = $(container);
    var parent = '#' + hash;
    let link = noku.getAPIUrl().substring(0, noku.getAPIUrl().length - 4) + hash;
    app.append(
        '<div class="meme-container" id="' + hash + '" data-memeid="' + id + '">\n' +
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
        '      <div class="meme-like-count" id="count-' + id + '"></div>\n' +
        '      <div class="meme-give btn ml-1" data-command="like" id="like-' + id + '"></div>\n' +
        '      <div class="meme-take btn" data-command="dislike" id="dislike-' + id + '"></div>\n' +
        '    </div>\n' +
        '    <div class="float-right">\n' +
        '       <div class="meme-repub btn mr-1" data-command="repub"></div>\n' +
        '       <button class="btn btn-clear meme-share mr-2" data-command="share" data-clipboard-text="' + link + '"></button>\n' +
        '       <div class="meme-comment btn mr-2" data-command="comment"></div>\n' +
        '    </div>\n' +
        '  </div>\n' +
        '</div>');

    $('#' + hash + ' .meme-share').on('click', function (target) {
        if (device.platform === 'browser') {
            alert("Url Copied");
        } else {
            cordova.plugins.clipboard.copy(link);
            window.plugins.toast.showWithOptions({
                    message: "Copied URL",
                    duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                    position: "bottom",
                    addPixelsY: -40  // added a negative value to move it up a bit (default 0)
                }
            );
        }
    });

    if (liked) {
        $('#like-' + id).removeClass("meme-give");
        $('#like-' + id).addClass("meme-given");
    }
    if (disliked) {
        $('#dislike-' + id).removeClass("meme-take");
        $('#dislike-' + id).addClass("meme-taken");
    }

    var plat = device.platform;
    if (plat === "browser") {
    } else {
        $(parent + " .meme-container").addClass("center-vertical");
    }

    $(".btn").on('click', function (e) {
        handleClick(e);
    });

    var url = noku.getCDNUrl();
    var authorID = meme.author;
    noku.getUserData(authorID, function (author) {
        var pfp = author.pfp;
        $(parent + " .op-pfp").html('<img class="pfp-image" src="' + url + pfp + '"  alt=""/>');
        let op_user = $(parent + " .op-username");
        op_user.html(author.username);
        $('.page-title').html(author.username);
        op_user.css('color', "#" + author.color);
    });

    var content = meme.mime_type;
    alert()
    if (content == null) return;

    if (content.includes("image")) $(parent + " .meme-body").html('<img class="meme-image swiper-zoom-target" src="' + url + meme.hash + '" />');
    if (content.includes("video")) {
        $(parent + " .meme-body").html('<video class="meme-image meme-video swiper-zoom-target" muted loop autoplay><source src="' + url + meme.hash + '" type="' + content + '"/></video><div class="mute-control btn" data-command="mute"></div>');
        $(parent + " .mute-control").click(function () {
            toggleMute(parent);
        });
    }
    if (content.includes("audio")) {
        $(parent + " .meme-body").html('<audio class="meme-image meme-audio" controls><source src="' + url + meme.hash + '" type="' + content + '"/></audio>');
        $(parent + " .mute-control").click(function () {
            toggleMute(parent);
        });
    }

    $(parent + " img").load(function (){
        window.mySwipe.update();
    });

    $(parent + " video").load(function (){
        window.mySwipe.update();
    });

    $(parent + " .meme-like-count").html(meme.likes - meme.dislikes);
    window.mySwipe.update();
}

async function loadComments(meme){
    let id = meme.id;
    let comment_container = $('.comments');
    comment_container.html('');
    noku.getCommentsByID(id, function(response, worked){
        if(!worked) return;
        var comments;
        try {
            comments = JSON.parse(response.data).data;
        } catch (e){
            console.log(e);
            console.log(response);
            alert(JSON.stringify(response));
            comments = [];
        }

        console.log(comments);

        var temp = [];
        for(var i = 0; i < comments.length; i++){
            if(comments[i].replyTo === -1){
                temp.push(comments[i]);
            }
        }
        for(i = 0; i < comments.length; i++){
            if(comments[i].replyTo !== -1){
                temp.push(comments[i]);
            }
        }
        comments = temp;
        temp = null;

        for(i = 0; i < comments.length; i++){
            let current = comments[i];
            if(current.replyTo === -1){
                if(current.author === noku.uid) create_posted_comment(current, 0, null, comment_container);
                else create_comment(current, 0, null, comment_container);
            }
            else {
                let parent = getCommentByID(comments, current.replyTo);
                let parent_comment = $("#comment-" + current.replyTo + " .comment-replies");
                let parent_comment_header = $("#comment-" + current.replyTo + " .comment-head");
                if(current.author === noku.uid) create_posted_comment(current, parent_comment_header.data("layer") + 1, parent, parent_comment);
                else create_comment(current, parent_comment_header.data("layer") + 1, parent, parent_comment);
            }
        }
    });
}
function create_comment(comment, layer, parent, container) {
    let html = (
        '  <div class="comment' + (parent == null ? " comment-root" : "") + '" id="comment-' + comment.id + '">' +
        '    <div class="comment-content">' +
        '      <div class="comment-head" data-layer="' + layer + '">' +
        '        <div class="float-left user-data">' +
        '        </div>' +
        '        <div class="float-right extra">' +
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
        '  </div>');

    container.prepend(html);

    noku.getUserData(comment.author, function (author) {
        let url = noku.getCDNUrl();

        var extra = "";
        if(parent != null){
            $("#comment-" + comment.id + " .extra").html(
                '          <div class="comment-reply-to">Reply To</div>' +
                '          <div class="comment-jump btn" data-comment="' + parent.id + '"></div>'
            );
        }

        $("#comment-" + comment.id + " .user-data").html(
            '          <div class="comment-pfp"><img class="pfp-image" src="'+url + author.pfp + '" /></div>' +
            '          <div class="comment-user" style="color:#' + author.color + ';">' + author.username + '</div>'
        );

        $("#comment-" + comment.id + " .comment-overlay").each(function () {
            $(this).fadeOut(0);
        });

        $("#comment-" + comment.id + " .comment-head").each(function () {
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
        });

        $("#comment-" + comment.id + " .comment-jump").click(function (){
            let id = $(this).data("comment");
            let comment = $("#comment-" + id);
            let overlay = $($("#comment-" + id + " .comment-overlay")[0]);
            let body = $("body, html");
            body.animate({ scrollTop: comment.position().top });
            body.promise().done(function() {
                overlay.fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200);
            });
        });
    });
}
function create_posted_comment(comment, layer, parent, container) {
    let html = (
        '  <div class="comment' + (parent == null ? " comment-root" : "") + '" id="comment-' + comment.id + '">' +
        '    <div class="comment-content">' +
        '      <div class="comment-head" data-layer="' + layer + '">' +
        '        <div class="float-left user-data">' +
        '          <div class="comment-pfp"><img class="pfp-image" src="'+noku.getCDNUrl() + noku.userdat.pfp + '" alt=""/></div>' +
        '          <div class="comment-user" style="color:#' + noku.userdat.color + ';">' + noku.userdat.username + '</div>' +
        '        </div>' +
        '        <div class="float-right extra">' +
        (parent != null ? '          <div class="comment-reply-to">Reply To</div>' +
            '          <div class="comment-jump btn" data-comment="' + parent.id + '"></div>' : '') +
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
        '  </div>');

    container.prepend(html);

    $("#comment-" + comment.id + " .comment-overlay").each(function () {
        $(this).fadeOut(0);
    });

    $("#comment-" + comment.id + " .comment-head").each(function () {
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
    });

    $("#comment-" + comment.id + " .comment-jump").click(function (){
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