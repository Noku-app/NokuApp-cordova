

function repub(){
    navigator.notification.alert("You republished this meme.", repub_done, "Republished", "Acknowledge");
}

function comment(){
    navigator.notification.alert("You commented this meme.", repub_done, "Commented", "Acknowledge");
}

function subscribe(){
    navigator.notification.alert("You subscribed to this user.", repub_done, "Subscribed", "Acknowledge");
}

function like(){
    navigator.notification.alert("You liked this meme.", repub_done, "Liked", "Acknowledge");
}

function dislike(){
    navigator.notification.alert("You disliked this meme.", repub_done, "Disliked", "Acknowledge");
}

function repub_done(){

}

function stop_media(hash) {
    var video = $("#" + hash + " video").get(0);
    if(video != null) {
        video.pause();
        video.currentTime = 0;
    }

    var audio = $("#" + hash + " audio");
    if(audio[0] != null) {
        audio[0].pause();
        audio.prop('currentTime', 0);
    }
}

function play_media(hash){
    let video = $("#" + hash + " video").get(0);
    if(video != null) video.play();

    let audio = $("#" + hash + " audio");
    if(audio != null) audio.trigger("play");;
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