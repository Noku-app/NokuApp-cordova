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

document.addEventListener(
    `deviceready`, 
    onDeviceReady, 
    false
);
var muted = true, noku = new Noku(), storage = window.localStorage;

// Control Variables
var PREF_LOAD_COUNT = 5, INIT_MEMES = false, SIGNED_IN = false, IS_MOD = false;
var cb = null, comment_posted = false;
var isSubmissions, pageTitle;

const onDeviceReady = () => {
    let handle = url => {
        console.log(`Open Url${url}`);
        noku.getMemeIDFromURL(
            url, 
            (response, worked) => {
                if(!worked) {
                    return
                }
                let id = NaN;
                try {
                    id = JSON.parse(response.data).data, id = parseInt(id);
                } catch (err) {
                    id = NaN;
                    return
                }
                if(isNaN(id)) {
                    return
                }
                storage.setItem(`meme.id`, id), redirect(`meme.html`);
            }
        );
    };
    window.plugins.webintent.onNewIntent(handle), window.plugins.webintent.getUri(handle);

    console.log(`Running cordova-${cordova.platformId}@${cordova.version}`);
    pageTitle = $(`.page-title`);
    noku.init(), noku.setCredentials(storage.getItem(`auth_token`), storage.getItem(`uid`));

    if(noku.uid) {
        noku.getThisUser(
        () => {
            noku.userdat = JSON.parse(storage.getItem(`userdat`));
            IS_MOD = noku.userdat[`perms`] > 31;
            console.log(noku.userdat);}
        );
    }

    $(`.btn`).on(
        `click`, 
        e => handleClick(e)
    );

    isSubmissions = getType() === 2;

    getValue(`em-measure`);

    noku.testToken(handleTokenCheck)
}

const handleTokenCheck = (response, worked) => {
    let data;
    try {
        data = JSON.parse(response.data);
    } catch (e){
        data = {};
        data.valid = false;
    }

    SIGNED_IN = data.valid === true;
    setup();
}

const redirect = page => {
    $(`body`).fadeOut(
        100, 
        () => {
            window.location.href = page;
        }
    );
}
var em; 
const getValue = id => {
    var div = document.getElementById(id);
    div.style.height = `1em`;
    return ( em = div.offsetHeight )
}

const handleClick = e => {
    var btn = $(e.target);
    let parent = btn.closest(`.swiper-slide`);

    var method = btn.data(`command`);

    if(method === `refresh`) window.location.reload(true);
    if(method === `repub` && SIGNED_IN) repub();
    if(method === `subscribe` && SIGNED_IN) subscribe();
    if(method === `like` && SIGNED_IN) likeMeme(parent, noku);
    if(method === `dislike` && SIGNED_IN) dislikeMeme(parent, noku);
    if(method === `mute`) toggleMute();

    if(method === `menu-close`) exitMenu();
    if(method === `menu`) enterMenu();
    if(method === `profile`) profile();
    if(method === `submissions`) redirect(`submissions.html`);
    if(method === `dank`) redirect(`index.html`);

    if(method === `comment`){
        let box = $(`.post-comment`);
        box.show();
        box.data(`replyTo`, -1);
        box.data(`meme`, parent.data(`memeid`));
        comment_posted = false;
    }
    if(method === `postcomment`){
        if(comment_posted) return;

        comment_posted = true;
        let box = $(`.post-comment`);
        let replyTo = box.data(`replyTo`);
        let meme = box.data(`meme`);
        let content = $(`.content`).val();
        noku.postComment(
            meme, 
            content, 
            replyTo, 
            (response, worked) => {
                let data;
                try {
                    data = JSON.parse(response.data);
                } catch (err){
                    data = {};
                    data.valid = false;
                    alert(JSON.stringify(response));
                }
                create_posted_comment(
                    {
                        id: data.data.id,
                        likes: 0,
                        dislikes: 0,
                        content: content
                    }, 
                    0, 
                    null, 
                    $(`.comments`)
                );
                $(`.content`).val(``);
            }
        );
        box.hide();
    }
    if(method === `viewprofile`) viewprofile(btn.data(`id`));
}
const profile = () => {
    storage.setItem(`view.id`, noku.uid);
    redirect(`profile.html`);
}
const viewprofile = id => {
    storage.setItem(`view.id`, id), redirect(`profile.html`);
}
const toggleMute = parent => {
    if(muted){
        $(`video`).prop(`muted`, false);
        $(`.mute-control`).css(`background-image`, `url("../www/img/audio_on.png")`);
        muted = false;
    } else {
        $(`video`).prop(`muted`, true);
        $(`.mute-control`).css(`background-image`, `url("../www/img/audio_off.png")`);
        muted = true;
    }
}
const enterMenu = () => {
    $(`#sidemenu`).css({"display": `block`}).addClass(`animated slideInRight`);
    $('#overlay').fadeIn();

    let close = $(`#menu-close`);
    close.removeClass(`hide`);
}
const exitMenu = () => {
    let side = $(`#sidemenu`);
    side.addClass(`animated slideOutRight`);
    side.css({'display': `none`});

    $(`#overlay`).fadeOut();
    let close = $(`#menu-close`);
    close.addClass(`hide`);
}

var set = 0;
const buffer = 5;

const setup = () => {
    $(`body`).fadeIn(100, ()=>{});
    $(`.post-comment`).hide();

    var ops = {
        direction: `horizontal`,
        autoHeight: true,
        loop: true,
        effect: `coverflow`,
        zoom: {
            maxRatio: 5,
        }
    };

    cb = new ClipboardJS(`.meme-share`);

    if(device.platform === `browser`) {
        $(`.swiper-container`).append(
            `<div class="swiper-button-prev"></div>` +
            `<div class="swiper-button-next"></div>`
        );

        ops.navigation = {
            nextEl: `.swiper-button-next`,
            prevEl: `.swiper-button-prev`
        }
    }
    window.mySwipe = new Swiper(`.swiper-container`, ops);

    //loadMemes(set * buffer, buffer);
    noku.checkUpdate(
        update => {
            navigator.notification.confirm(
                (`New: ${update.version}\n` +
                    `Yours: ${noku.version}\n` +
                    `And Update is available to download, would you like to update?`),
                number => {
                    if(number === 1){
                        downloadUpdate();
                    }
                },
                `Update Available!`, 
                [`Yes`, `No`]
            );
        }
    );
    loadAllMemes(getType());

    let swiper = window.mySwipe;
    swiper.on(
        `transitionStart`, 
        () => {
            let left = this.previousIndex < this.activeIndex;
            if(left){
                if(typeof noku.memes[this.activeIndex - 5] ===  `undefined`) { }
                else unloadMemeContent(noku.memes[this.activeIndex - 5]);
            } else {
                if(typeof noku.memes[this.activeIndex + 5] === `undefined`) { }
                else unloadMemeContent(noku.memes[this.activeIndex + 5]);
            }
            stop_media(noku.memes[this.previousIndex]);
            $(`.post-comment`).hide();
        }
    );
    swiper.on(
        `transitionEnd`, 
        () => {
            updatePageTitle((this.activeIndex + 1), Object.keys(noku.memes).length);
            let curr = noku.memes[this.activeIndex];

            for(var i = 0; i < 11; i++){
                let pos = indexToPos(this.activeIndex, (i - 5));
                if(noku.memes[pos].loaded) continue;

                createMeme("#slide-" + (this.activeIndex + (i - 5)) % 11, memes[pos], i === 5);
                loadMemeContent(noku.memes[pos]);
            }

            loadComments(curr);

            play_media(curr);
            storage.setItem(isSubmissions ? `sub.last` : `dank.last`, this.activeIndex);
        }
    );
    /*
    swiper.on('slideChange', function () {
        if(swiper.isEnd){
            const length = swiper.slides.length;
            for(var i = 0; i < length; i++){
                if(i === swiper.activeIndex) continue;
                swiper.slides[i].
                swiper.removeSlide(i);
            }
            set++;
            loadMemes(set * buffer, buffer);
        }
    });
    */
}

const updatePageTitle = (index, max) => {
    pageTitle.html(`${(isSubmissions ? `Submissions: ` : `Dank Memes: `)}<span style="font-size: 0.9em;">${index}/${max}</span>`);
}

const downloadUpdate = () => {
    window.requestFileSystem(
        LocalFileSystem.PERSISTENT, 
        0, 
        onFileSystemSuccess = fileSystem => {
            let storageLocation = ``;
            console.log(device.platform);
            switch (device.platform) {
                case `Android`:
                    storageLocation = `file:///storage/emulated/0/download/`;
                    break;
                case `iOS`:
                    storageLocation = cordova.file.documentsDirectory;
                    break;
            }
            let localPath = `${storageLocation}new-android.apk`, fileTransfer = new FileTransfer();
            alert(localPath);
            fileTransfer.download(
                `https://cdn.xemplarsoft.com/app-debug.apk`, 
                localPath, 
                entry => {
                    navigator.notification.alert(`To finish updating, navigate to your downloads folder and click new-android.apk`, ()=>{}, `Finishing Steps`, `Okay`)
                }, 
                error => {
                    alert(`Error downloading the latest updates! - error: ${JSON.stringify(error)}`);
                }
            );
        }, 
        error => { 
            alert(`Download update failed: ${error.code}`);
        }
    );
}

const loadAllMemes = type => {
    noku.getMemes(
        type, 
        (response, worked) => {
            console.log(response);
            const swipe = window.mySwipe;
            if(!worked){
                createMeme(`.swiper-wrapper`, null);
                return;
            }
            var memes;
            try{
                let data = JSON.parse(response.data);
                memes = data.data;
            } catch (err){
                memes = [].push(null);
            }

            var lastSeen = storage.getItem(isSubmissions ? `sub.last` : `dank.last`);
            if(lastSeen == null) lastSeen = 0;

            noku.memes = memes;
            for(var x = 0; x < memes.length; x++){
                memes[x].loaded = false;
            }

            for(var i = 0; i < 11; i++){
                let pos = indexToPos(this.activeIndex, (i - 5));
                createMeme(`#slide-` + (this.activeIndex + (i - 5)) % 11, memes[pos], i === 5);
                loadMemeContent(memes[pos]);
            }

            swipe.update();

            play_media(noku.memes[lastSeen]);
            swipe.slideTo(lastSeen, 0, true);
        }
    );
}

const indexToPos = (center, index) => center + ((index % 11) - 5);


const loadComments = async meme => {
    let id = meme.id, comment_container = $(`.comments`);
    comment_container.html(``);
    noku.getCommentsByID(
        id, 
        (response, worked) => {
        if(!worked) {
            return
        }
        var comments;
        try {
            comments = JSON.parse(response.data).data;
        } catch (err){
            console.log(err);
            console.log(response);
            alert(JSON.stringify(response));
            comments = [];
        }

        console.log(comments);

        var temp = [];
        for(let i in comments){
            if(comments[i].replyTo === -1){
                temp.push(comments[i]);
            }
        }
        for(let i in comments){
            if(comments[i].replyTo !== -1){
                temp.push(comments[i]);
            }
        }
        comments = temp, temp = null;

        for(let i in comments){
            let current = comments[i];
            if(current.replyTo === -1){
                if(current.author === noku.uid) create_posted_comment(current, 0, null, comment_container);
                else create_comment(current, 0, null, comment_container);
            }
            else {
                let parent = getCommentByID(comments, current.replyTo),
                    parent_comment = $(`#comment-${current.replyTo}.comment-replies`),
                    parent_comment_header = $(`#comment-${current.replyTo}.comment-head`);
                if(current.author === noku.uid) create_posted_comment(current, parent_comment_header.data(`layer`) + 1, parent, parent_comment);
                else create_comment(current, parent_comment_header.data("layer") + 1, parent, parent_comment);
            }
        }
    });
}
const create_comment = (comment, layer, parent, container) => {
    let liked = comment.liked, disliked = comment.disliked;

    let html = `
        <div class="comment${(parent == null ? " comment-root" : "")}" id="comment-${comment.id}">
            <div class="comment-content">
                <div class="comment-head" data-layer="${layer}">
                    <div class="float-left user-data"></div>
                    <div class="float-right extra"></div>
                </div>
                <div class="comment-body">${comment.content}</div>
                <div class="comment-vote"
                    <div class="float-left">
                        <div class="comment-like-count" id="comment-count-${comment.id}">${comment.likes - comment.dislikes}</div>
                        <div class="comment-like btn" data-comment="${comment.id}" id="comment-like-${comment.id}"></div>
                        <div class="comment-dislike btn" data-comment="${comment.id}" id="comment-dislike-${comment.id}></div>
                    </div>
                    <div class="float-right">
                        <div class="comment-reply btn" data-comment="${comment.id}"></div>
                    <div>
                </div>
                <div class="comment-overlay"></div>
            <div>
            <div class="comment-replies"></div>
        <div>
    `;

    container.prepend(html);

    if (liked) {
        $(`#comment-${comment.id}.comment-liked`).removeClass(`comment-give`);
        $(`#comment-${comment.id}.comment-like`).addClass(`comment-given`);
    }
    if (disliked) {
        $(`#comment-${comment.id}.comment-dislike`).removeClass(`comment-take`);
        $(`#comment-${comment.id}.comment-dislike`).addClass("comment-taken");
    }

    $(`#comment-${comment.id} .comment-like`).click(
        (e) => {
            likeComment(comment.id, noku);
        }
    );

    $(`#comment-${comment.id} .comment-dislike`).click(
        (e) => {
            dislikeComment(comment.id, noku);
        }
    );

    noku.getUserData(
        comment.author, 
        author => {
            let url = noku.getCDNUrl(), extra = ``;

            if(parent){
                $(`#comment-${comment.id} .extra`).html(
                    `
                    <div class="comment-reply-to">Reply To</div>
                    <div class="comment-jump btn" data-comment="${parent.id}"></div>
                    `
                );
            }

            $(`#comment-${comment.id} .user-data`).html(
                `          
                <div class="comment-pfp"><img class="pfp-image" src="${url}${author.pfp}" /></div>          
                <div class="comment-user" style="color:#${author.color};">${author.username}</div>
                `
            );

            $(`#comment-${comment.id} .comment-overlay`).each(
                () => {
                    $(this).fadeOut(0);
                }
            );

            $(`#comment-${comment.id} .comment-head`).each(
                () => {
                    let t = $(this), pad = (t.data("layer") * 2) + 1, wid = pad + 1;

                    t.css(`padding-left`, `${t.data(`layer`) * 2}em`);
                    t.css(`width`, `calc(100% - ${t.data(`layer`) * 2}em)`);

                    let comment_body = t.parent().children(`.comment-body`);
                    comment_body.css(`padding-left`, `${pad}em`);
                    comment_body.css(`width`, `calc(100% - ${wid}em)`);

                    let comment_vote = t.parent().children(`.comment-vote`);
                    comment_vote.css(`padding-left`, `${pad}em`);
                    comment_vote.css(`width`, `calc(100% - ${pad}em)`);
                }
            );
        }
    );
}
const create_posted_comment = (comment, layer, parent, container) => {

    let html = `
        <div class="comment"${parent == null ? `comment-root` : ``}" id="comment-${comment.id}">
            <div class="comment-content">
                <div class="comment-hear" data-layer="${layer}">
                    <div class="float-left user-data">
                        <div class="comment-pfp"<img class="pfp-image" src"${noku.getCDNUrl()}${noku.userdat.pfp}" alt=""/></div>
                        <div class="comment-user" style="color:#${noku.userdat.color};">${noku.userdat.username}</div>
                    </div>
                <div class="float-right extra">
                    ${parent != null ? `<div class="comment-reply-to">Reply</div><div class="comment-jump btn" data-comment="${parent.id}"></div>` : ``}
                </div>
            </div>
            <div class="comment-body">${comment.content}</div>
            <div class="comment-vote">
                <div class="float-left">
                    <div class="comment-like-count">${comment.likes - comment.dislikes}</div>
                    <div class="comment-like btn" data-comment="${comment.id}"></div>
                    <div class="comment-dislike btn" data-comment="${comment.id}"></div>
                </div>
                <div class="float-right">
                    <div class="comment-reply btn" data-comment="${comment.id}"></div>
                </div>
            </div>
            <div class="comment-replies"></div>
        </div>
    `

    container.prepend(html);

    $(`#comment-${comment.id} .comment-overlay`).each(
        () => {
            $(this).fadeOut(0);
        }
    );

    $(`#comment-${comment.id} .comment-head`).each(
        () => {
            let t = $(this), pad = (t.data(`layer`) * 2) + 1, wid = pad + 1;

            t.css(`padding-left`, `${t.data("layer") * 2}em`);
            t.css(`width`, `calc(100% - ${t.data("layer") * 2}em)`);

            let comment_body = t.parent().children(`.comment-body`);
            comment_body.css(`padding-left`, `${pad}em`);
            comment_body.css(`width`, `calc(100% - ${wid}em)`);

            let comment_vote = t.parent().children(`.comment-vote`);
            comment_vote.css(`padding-left`, `${pad}em`);
            comment_vote.css(`width`, `calc(100% - ${pad}em)`);
        }
    );

    $(`#comment-${comment.id} .comment-jump`).click(
        () => {
            let id = $(this).data("comment"), comment = $("#comment-" + id), 
                overlay = $($("#comment-" + id + " .comment-overlay")[0]), body = $("body, html");
            body.animate({ scrollTop: comment.position().top });
            body.promise().done(
                () => {
                    overlay.fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200);
                }
            );
        }
    );
}
const getCommentByID = (comments, id) => {
    for(let i in comments){
        if(comments[i].id === id) {
            return comments[i]
        }
    }
    return null;
}
const createNullMeme = container => {
    let app = $(container);
    app.append(
        `
            <div class="swiper-slide meme-container" id="NULLMEME" data-memeid="NULLMEME">
                <div class="meme-op">
                    <div class="float-left">
                        <div class="op-pfp"></div>
                        <div class="op-username">noku team</div>
                    </div>
                    <div class="float-right">
                        <div class="btn btn-black mr-2 my-auto" data-command="none">No touch!</div>
                    </div>
                </div>
                <div class="meme-body swiper-zoom-container">
                    <div class="container p6">
                        <h1>End of the line pal!</h1>
                        <p>Unfortunately, you have reached the end of the meme stream, come back later.</p>
                    </div>
                </div>
                <div class="meme-footer">
                    <div class="float-left">
                        <div class="meme-like-count"></div>
                        <div class="meme-take btn ml-1" data-command="none"></div>
                        <div class="meme-take btn" data-command="none"></div>
                    </div>
                    <div class="float-right"
                        <div class="meme-take btn mr-1" data-command="none"></div>
                        <div class="meme-take btn mr-2" data-command="none"></div>
                        <div class="meme-take btn mr-2" data-command="none"></div>
                    </div>
                </div>
            </div>
        `
    );
}
const createMeme = (container, meme, focus) => {
    if (meme == null) {
        return createNullMeme(container)
    }
    let id = meme.id, hash = meme.hash, liked = meme.liked, disliked = meme.disliked, 
        author = meme.author, app = $(container), parent = `#${hash}`, 
        link = `${noku.getAPIUrl().substring(0, noku.getAPIUrl().length - 4)}home/${hash}`;

    app.append(
        `
            <div class="meme-container" id="${hash}" data-memeid="${id}">
                <div class="meme-op">
                    <div class="float-left">
                        <div class="op-pfp"></div>
                        <div class="op-username"></div>
                    </div>
                    <div class="float-right">
                        <div class="btn btn-black mr-2 my-auto" data-command="viewprofile" data-id="${author}">View Profile</div>
                    </div>
                </div>
                <div class="meme-footer">
                    <div class="float-left">
                        <div class="meme-like-count" id="count-${id}"></div>
                        ${SIGNED_IN?`<div class="meme-give btn ml-1" data-command="like" id="like-${id}"</div>
                            <div class="meme-take btn" data-command="dislike" id="dislike-${id}"></div>`:``}
                    </div>
                    <div class="float-right"> 
                        ${IS_MOD?`<div class="meme-flag btn mr-1" data-command="flag"></div>` : ``}
                        ${SIGNED_IN?`<div class="meme-repub btn mr-1" data-command="repub"></div>`: ``}
                        <button class="btn btn-clear meme-share mr-2" data-command="share" data-clipboard-text="${link}"></button>
                        ${SIGNED_IN?`<div class="meme-comment btn mr-2" data-command="comment"></div>`:``}
                    </div>
                </div>
            </div>
        `
    )
    
    $(`#${hash} .meme-share`).on(
        `click`, 
        target => {
            if (device.platform === `browser`) {
                alert(`Url Copied`);
            } else {
                cordova.plugins.clipboard.copy(link);
                window.plugins.toast.showWithOptions({
                        message: `Copied URL`,
                        duration: `short`, // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                        position: `bottom`,
                        addPixelsY: -40  // added a negative value to move it up a bit (default 0)
                    }
                );
            }
        }
    );

    if (liked) {
        $(`#like-${id}`).removeClass(`meme-give`);
        $(`#like-${id}`).addClass(`meme-given`);
    }
    if (disliked) {
        $(`#dislike-${id}`).removeClass(`meme-take`);
        $(`#dislike-${id}`).addClass(`meme-taken`);
    }

    let plat = device.platform;
    if (plat === `browser`) {
    } else {
        $(`${parent} .meme-container`).addClass(`center-vertical`);
    }

    $(`.btn`).on(`click`,
    e => {
            handleClick(e);
        }
    );

    let url = noku.getCDNUrl(), authorID = meme.author;
    
    noku.getUserData(
        authorID, 
        author => {
            let pfp = author.pfp;
            $(`${parent} .op-pfp`).html(`<img class="pfp-image" src="${url}${pfp}" alt=""/>`);
            let op_user = $(parent + `${parent} .op-username`);
            op_user.html(author.username);
            op_user.css(`color`, `#${author.color}`);
        }
    );

    //Load when swiped to

    $(`${parent} .meme-like-count`).html(meme.likes - meme.dislikes);
    window.mySwipe.update();
}

const unloadMemeContent = meme => {
    if(!meme.loaded) {
        return
    }
    meme.loaded = false;
    let hash = meme.hash, parent = `#${hash}`;
    $(`${parent} .meme-body`).html(``);
}

const loadMemeContent = meme => {
    if(meme.loaded) {
        return
    }
    meme.loaded = true;
    let hash = meme.hash, parent = `#${hash}`, url = noku.getCDNUrl();

    var content = meme.mime_type;
    if (content == null) {
        return
    }

    if (content.includes(`image`)) $(`${parent} .meme-body`).html(`<img class="meme-image swiper-zoom-target" src="${url}${meme.hash}"/>`);
    if (content.includes(`embed`)){
        noku.getContent(
            `${url}${meme.hash}`, 
            (response, worked) => {
                if(!worked) {
                    return
                }
                if(device.platform === `browser`) {
                    $(`${parent} .meme-body`).html(response.data);
                } else {
                    $(`${parent} .meme-body`).html(`<iframe class="meme-embed" src="${noku.getCDNUrl()}${meme.hash}" onload="resizeIframe(this)"/>`);
                }
            }
        );
    }
    if (content.includes(`video`)) {
        $(`${parent} .meme-body`).html(`<video class="meme-image meme-video swiper-zoom-target" muted loop><source src="${url}${meme.hash}" type="${content}"/></video><div class="mute-control btn" data-command="mute"></div>`);
        $(`${parent} .mute-control`).click(
            () => {
                toggleMute(parent);
            }
        );
    }
    if (content.includes(`audio`)) {
        $(`${parent} .meme-body`).html(`<audio class="meme-image meme-audio" controls><source src="${url}${meme.hash}" type="${content}"/></audio>`);
        $(`${parent} .mute-control`).click(
            () => {
                toggleMute(parent);
            }
        );
    }

    $(`${parent} .meme-image`).one(
        `load`, 
        () => {
            window.mySwipe.update();
        }
    );

    $(`${parent} .meme-video`).on(
        'load', 
        () => {
            window.mySwipe.update();
            if(focus) {
                $(`${parent} video`)[0].autoplay = true;
            }
            play_media(meme);
        }
    );
    window.mySwipe.update();
}