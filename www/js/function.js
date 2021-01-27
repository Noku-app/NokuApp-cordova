const repub = () => {
    navigator.notification.alert(`You republished this meme.`, repub_done, `Republished`, `Acknowledge`);
}

const comment = () => {
    navigator.notification.alert(`You commented this meme.`, repub_done, `Commented`, `Acknowledge`);
}

const subscribe = () => {
    navigator.notification.alert(`You subscribed to this user.`, repub_done, `Subscribed`, `Acknowledge`);
}

const likeMeme = (parent, noku) => {
    let id = parent.data(`memeid`),
        like_counter = $(`#count-${id}`),
        liked = $(`#like-${id}`),
        disliked = $(`#dislike-${id}`);

    noku.likeMeme(
        id, 
        liked.hasClass(`meme-give`), 
        (response, worked) => {
            if(!worked) {
                return
            }
            let data;
            try{
                data = JSON.parse(response.data), data = data.data;
            } catch (err){
                data = {}, data.liked = false, data.likes = 0, data.dislikes = 0;
            }

            like_counter.html(data.likes - data.dislikes);

            if(data.liked){
                liked.removeClass(`meme-give`), liked.addClass(`meme-given`);
            } else {
                liked.removeClass(`meme-given`), liked.addClass(`meme-give`);
            }

            disliked.removeClass(`meme-taken`), disliked.addClass(`meme-take`);
        }
    );
}

const likeComment = (id, noku) => {
    let like_counter = $(`#comment-count-${id}`),
        liked = $(`#comment-like-${id}`),
        disliked = $(`#comment-dislike-${id}`);

    noku.likeComment(
        id, 
        liked.hasClass(`comment-give`), 
        (response, worked) => {
            if(!worked) {
                return
            }
            let data;
            try{
                data = JSON.parse(response.data), data = data.data;
            } catch (err){
                data = {}, data.liked = false, data.likes = 0, data.dislikes = 0;
            }

            like_counter.html(data.likes - data.dislikes);

            if(data.liked){
                liked.removeClass(`comment-give`), liked.addClass(`comment-given`);
            } else {
                liked.removeClass(`comment-given`), liked.addClass(`comment-give`);
            }

            disliked.removeClass(`comment-taken`), disliked.addClass(`comment-take`);
        }
    );
}

const dislikeMeme = (parent, noku) => {
    let id = parent.data(`memeid`),
        like_counter = $(`#count-${id}`),
        liked = $(`#like-` + id),
        disliked = $(`#dislike-` + id);

    noku.dislikeMeme(
        id, 
        disliked.hasClass(`meme-take`),
        (response, worked) => {
            if(!worked) {
                return
            }
            let data;
            try{
                data = JSON.parse(response.data), data = data.data;
            } catch (e){
                data = {}, data.disliked = false, data.likes = 0, data.dislikes = 0;
            }

            like_counter.html(data.likes - data.dislikes);

            if(data.disliked){
                disliked.removeClass(`meme-take`), disliked.addClass(`meme-taken`);
            } else {
                disliked.removeClass(`meme-taken`), disliked.addClass(`meme-take`);
            }

            liked.removeClass(`meme-given`), liked.addClass(`meme-give`);
        }
    );
}

const dislikeComment = (id, noku) => {
    let like_counter = $(`#comment-count-${id}`),
        liked = $(`#comment-like-${id}`),
        disliked = $(`#comment-dislike-${id}`);

    noku.dislikeComment(
        id, 
        disliked.hasClass(`comment-take`), 
        (response, worked) => {
            if(!worked) {
                return
            }
            let data;
            try{
                data = JSON.parse(response.data), data = data.data;
            } catch (e){
                data = {}, data.disliked = false, data.likes = 0, data.dislikes = 0;
            }

            like_counter.html(data.likes - data.dislikes);

            if(data.disliked){
                disliked.removeClass(`comment-take`), disliked.addClass(`comment-taken`);
            } else {
                disliked.removeClass(`comment-taken`), disliked.addClass(`comment-take`);
            }

            liked.removeClass(`comment-given`), liked.addClass(`comment-give`);
        }
    );
}

const repub_done = () => {

}

const stop_media = meme => {
    if(!meme) {
        return
    }

    let hash = meme.hash, video = $(`#${hash} video`).get(0);
    if(video) {
        video.pause(), video.currentTime = 0;
    }
}

const play_media = meme => {
    if(!meme) {
        return
    }

    let hash = meme.hash, video = $(`#${hash} video`).get(0);
    if(video) {
        video.play()
    }

    let audio = $(`#${hash} audio`);
    if(audio) {
        audio.trigger(`play`)
    }
}

const resizeIframe = obj => {
    try {
        obj.style.height = obj.contentWindow.document.documentElement.scrollHeight + `px`;
        if (window.mySwipe) {
            window.mySwipe.update()
        }
    } catch (err) {
        console.log(err);
    }
}

const create_context = (jq_comp, title, data) => {
    return {
        title: title,
        items: data,
        x: $(jq_comp).position().left,
        y: $(jq_comp).position().top
    }
}

const setInvisible = element => {
    element.style.opacity = 0, element.style.filter = `alpha(opacity=0)`;
}

const fadeIn = element => {
    element.style.display = `block`;
    var op = 0.1,  timer = setInterval(
        () => {
            if (op >= 1){
                clearInterval(timer)
            }
            element.style.opacity = op, element.style.filter = `alpha(opacity=${op * 100})`, op += op * 0.1;
        }, 
        20
    );
}

const getDaysAgo = created => Math.round(Math.abs(((new Date()) - created) / (24 * 60 * 60 * 1000)));

const fadeOut = element => {
    var op = 1, timer = setInterval(
        () => {
            if (op <= 0.1){
                clearInterval(timer), element.style.display = `none`;
            }
            element.style.opacity = op, element.style.filter = `alpha(opacity=${op * 100})`, op -= op * 0.1;
        }, 
        50
    );
}

const getType = file_URI => {
    window.resolveLocalFileSystemURI(
        file_URI,
        fileEntry => {
            fileEntry.file(
                filee => alert(filee.type), 
                () => alert(`error getting MIME type`)
            );
        }, 
        error => {}
    );
}

const copyToClipboard = elem => {
    let targetId = `_hiddenCopyText_`;
    let origSelectionStart, origSelectionEnd;

    target = document.getElementById(targetId);
    if (!target) {
        var target = document.createElement(`textarea`);
        target.style.position = `absolute`, target.style.left = `-9999px`, target.style.top = `0`, 
            target.id = targetId, document.body.appendChild(target);
    }
    target.textContent = elem.textContent;

    let currentFocus = document.activeElement;
    target.focus(), target.setSelectionRange(0, target.value.length);

    let succeed;
    try {
        succeed = document.execCommand(`copy`);
    } catch(e) {
        succeed = false;
    }
    if (currentFocus && typeof currentFocus.focus === `function`) {
        currentFocus.focus();
    }

    target.textContent = ``;
    return succeed;
}