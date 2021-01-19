

function repub(){
    navigator.notification.alert("You republished this meme.", repub_done, "Republished", "Acknowledge");
}

function comment(){
    navigator.notification.alert("You commented this meme.", repub_done, "Commented", "Acknowledge");
}

function subscribe(){
    navigator.notification.alert("You subscribed to this user.", repub_done, "Subscribed", "Acknowledge");
}

function likeMeme(parent, noku){
    let id = parent.data("memeid");
    let like_counter = $("#count-" + id);
    let liked = $("#like-" + id);
    let disliked = $("#dislike-" + id);

    noku.likeMeme(id, liked.hasClass("meme-give"), function (response, worked){
        if(!worked) return;
        var data;
        try{
            data = JSON.parse(response.data);
            data = data.data;
        } catch (e){
            data = {};
            data.liked = false;
            data.likes = 0;
            data.dislikes = 0;
        }

        like_counter.html(data.likes - data.dislikes);

        if(data.liked){
            liked.removeClass("meme-give");
            liked.addClass("meme-given");
        } else {
            liked.removeClass("meme-given");
            liked.addClass("meme-give");
        }

        disliked.removeClass("meme-taken");
        disliked.addClass("meme-take");
    });
}

function likeComment(id, noku){
    let like_counter = $("#comment-count-" + id);
    let liked = $("#comment-like-" + id);
    let disliked = $("#comment-dislike-" + id);

    noku.likeComment(id, liked.hasClass("comment-give"), function (response, worked){
        if(!worked) return;
        var data;
        try{
            data = JSON.parse(response.data);
            data = data.data;
        } catch (e){
            data = {};
            data.liked = false;
            data.likes = 0;
            data.dislikes = 0;
        }

        like_counter.html(data.likes - data.dislikes);

        if(data.liked){
            liked.removeClass("comment-give");
            liked.addClass("comment-given");
        } else {
            liked.removeClass("comment-given");
            liked.addClass("comment-give");
        }

        disliked.removeClass("comment-taken");
        disliked.addClass("comment-take");
    });
}

function dislikeMeme(parent, noku){
    let id = parent.data("memeid");
    let like_counter = $("#count-" + id);
    let liked = $("#like-" + id);
    let disliked = $("#dislike-" + id);

    noku.dislikeMeme(id, disliked.hasClass("meme-take"), function (response, worked){
        if(!worked) return;
        var data;
        try{
            data = JSON.parse(response.data);
            data = data.data;
        } catch (e){
            data = {};
            data.disliked = false;
            data.likes = 0;
            data.dislikes = 0;
        }

        like_counter.html(data.likes - data.dislikes);

        if(data.disliked){
            disliked.removeClass("meme-take");
            disliked.addClass("meme-taken");
        } else {
            disliked.removeClass("meme-taken");
            disliked.addClass("meme-take");
        }

        liked.removeClass("meme-given");
        liked.addClass("meme-give");
    });
}

function dislikeComment(id, noku){
    let like_counter = $("#comment-count-" + id);
    let liked = $("#comment-like-" + id);
    let disliked = $("#comment-dislike-" + id);

    noku.dislikeComment(id, disliked.hasClass("comment-take"), function (response, worked){
        if(!worked) return;
        var data;
        try{
            data = JSON.parse(response.data);
            data = data.data;
        } catch (e){
            data = {};
            data.disliked = false;
            data.likes = 0;
            data.dislikes = 0;
        }

        like_counter.html(data.likes - data.dislikes);

        if(data.disliked){
            disliked.removeClass("comment-take");
            disliked.addClass("comment-taken");
        } else {
            disliked.removeClass("comment-taken");
            disliked.addClass("comment-take");
        }

        liked.removeClass("comment-given");
        liked.addClass("comment-give");
    });
}

function repub_done(){

}

function stop_media(meme) {
    if(meme == null) return;

    let hash = meme.hash;
    var video = $("#" + hash + " video").get(0);
    if(video != null) {
        video.pause();
        video.currentTime = 0;
    }
}

function play_media(meme) {
    if(meme == null) return;

    let hash = meme.hash;

    let video = $("#" + hash + " video").get(0);
    if(video != null) video.play();

    let audio = $("#" + hash + " audio");
    if(audio != null) audio.trigger("play");;
}

function resizeIframe(obj) {
    try {
        obj.style.height = obj.contentWindow.document.documentElement.scrollHeight + 'px';
        if (window.mySwipe != null) window.mySwipe.update();
    } catch (e) {
        console.log(e);
    }
}

function create_context(jq_comp, title, data){
    return {
        title: title,
        items: data,
        x: $(jq_comp).position().left,
        y: $(jq_comp).position().top
    }
}

function setInvisible(element){
    element.style.opacity = 0;
    element.style.filter = 'alpha(opacity=0)';
}

function fadeIn(element) {
    var op = 0.1;  // initial opacity
    element.style.display = 'block';
    var timer = setInterval(function () {
        if (op >= 1){
            clearInterval(timer);
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op += op * 0.1;
    }, 20);
}

function getDaysAgo(created){
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs(((new Date()) - created) / oneDay));
}

function fadeOut(element) {
    var op = 1;  // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.1){
            clearInterval(timer);
            element.style.display = 'none';
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * 0.1;
    }, 50);
}

function getType(file_URI) {
    window.resolveLocalFileSystemURI(file_URI, function(fileEntry) {
        fileEntry.file(function(filee) {
            alert(filee.type); //THIS IS MIME TYPE
        }, function() {
            alert('error getting MIME type');
        });

    }, function (error){

    });
}

function copyToClipboard(elem) {
    var targetId = "_hiddenCopyText_";
    var origSelectionStart, origSelectionEnd;

    target = document.getElementById(targetId);
    if (!target) {
        var target = document.createElement("textarea");
        target.style.position = "absolute";
        target.style.left = "-9999px";
        target.style.top = "0";
        target.id = targetId;
        document.body.appendChild(target);
    }
    target.textContent = elem.textContent;

    var currentFocus = document.activeElement;
    target.focus();
    target.setSelectionRange(0, target.value.length);

    var succeed;
    try {
        succeed = document.execCommand("copy");
    } catch(e) {
        succeed = false;
    }
    if (currentFocus && typeof currentFocus.focus === "function") {
        currentFocus.focus();
    }

    target.textContent = "";
    return succeed;
}