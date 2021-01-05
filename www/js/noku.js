class Noku {

    init(){
        this.http = cordova.plugin.http;
        this.http.setDataSerializer('json');
        this.http.setRequestTimeout(5.0);

        this.memes = [null];
        this.users = [];
    }

    testToken(callback){
        const options = {
            method: 'post',
            data: { "token":this.token, "uid":this.uid },
            headers: {}
        };

        this.http.sendRequest(this.getAPIUrl() + "tokencheck", options, function(response) {
            callback(response, true);
        }, function(response) {
            callback(response, false);
        });
    }

    login(username, password, callback){
        const options = {
            method: 'post',
            data: { "username": username, "password": password },
            headers: { }
        };

        this.http.sendRequest(this.getAPIUrl() + "login", options, function(response) {
            callback(response, true);
        }, function(response) {
            callback(response, false);
        });
    }

    register(username, password, email, callback){
        const options = {
            method: 'post',
            data: { "email": email, "username": username, "password": password },
            headers: { }
        };

        this.http.sendRequest(this.getAPIUrl() + "register", options, function(response) {
            callback(response, true);
        }, function(response) {
            callback(response, false);
        });
    }

    setCredentials(token, uid){
        this.token = token;
        this.uid = uid;
    }

    getMemes(callback){
        const options = {
            method: 'post',
            data: { "uid": this.uid, "token": this.token },
            headers: { }
        };

        this.http.sendRequest(this.getAPIUrl() + "getmemes", options, function(response) {
            callback(response, true);
        }, function(response) {
            callback(response, false);
        });
    }

    getMemesLimit(start, length, callback){
        const options = {
            method: 'post',
            data: {
                uid: this.uid,
                token: this.token,
                start: start,
                length: length,
            },
            headers: { }
        };

        this.http.sendRequest(this.getAPIUrl() + "getmemeslimit", options, function(response) {
            callback(response, true);
        }, function(response) {
            callback(response, false);
        });
    }

    sendError(){
        const options = {
            method: 'post',
            data: { "uid": this.uid, "token": this.token },
            headers: { }
        };

        this.http.sendRequest(this.getAPIUrl() + "getmemes", options, function(response) {
            navigator.notification.alert("Error report was sent successfully.", function(){}, "Error Report")
        }, function() {
            console.log();
        });
    }

    getCDNUrl() {
        return "https://cdn.xemplarsoft.com/";
    }

    getAPIUrl() {
        return "https://xemplarsoft.com/noku/api/";
    }

    getUploadUrl() {
        return "https://xemplarsoft.com/noku/upload";
    }

    getUserData(id, callback) {
        const options = {
            method: 'post',
            data: { "uid": this.uid, "token": this.token, "user_id": id },
            headers: { }
        };

        this.http.sendRequest(this.getAPIUrl() + "getuserdata", options, function(response) {
            callback(response, true);
        }, function(response) {
            callback(response, false);
        });
    }

    getAllLikes(id, callback){
        const options = {
            method: 'post',
            data: { "uid": this.uid, "token": this.token, "user_id": id },
            headers: { }
        };

        this.http.sendRequest(this.getAPIUrl() + "getalllikes", options, function(response) {
            callback(response, true);
        }, function(response) {
            callback(response, false);
        });
    }

    getAllMemes(id, callback){
        const options = {
            method: 'post',
            data: { "uid": this.uid, "token": this.token, "user_id": id },
            headers: { }
        };

        this.http.sendRequest(this.getAPIUrl() + "getallmemes", options, function(response) {
            callback(response, true);
        }, function(response) {
            callback(response, false);
        });
    }

    getAllSubscribers(id, callback){
        const options = {
            method: 'post',
            data: { "uid": this.uid, "token": this.token, "user_id": id },
            headers: { }
        };

        this.http.sendRequest(this.getAPIUrl() + "getallsubs", options, function(response) {
            callback(response, true);
        }, function(response) {
            callback(response, false);
        });
    }

    getMimeType(hash, callback){
        const options = {
            method: 'post',
            data: { "uid": this.uid, "token": this.token, "hash": hash },
            headers: { }
        };

        this.http.sendRequest(this.getAPIUrl() + "getmimetype", options, function(response) {
            callback(response, true);
        }, function(response) {
            callback(response, false);
        });
    }

    getMemeData(id, callback){
        const options = {
            method: 'post',
            data: { "uid": this.uid, "token": this.token, "id": id },
            headers: { }
        };

        this.http.sendRequest(this.getAPIUrl() + "getmemedata", options, function(response) {
            callback(response, true);
        }, function(response) {
            callback(response, false);
        });
    }

    likeMeme(id, state, callback){
        const options = {
            method: 'post',
            data: { "uid": this.uid, "token": this.token, "id": id, "state":state },
            headers: { }
        };

        this.http.sendRequest(this.getAPIUrl() + "likememe", options, function(response) {
            callback(response, true);

        }, function(response) {
            callback(response, false);
        });
    }

    dislikeMeme(id, state, callback){
        const options = {
            method: 'post',
            data: { "uid": this.uid, "token": this.token, "id": id, "state":state },
            headers: { }
        };

        this.http.sendRequest(this.getAPIUrl() + "dislikememe", options, function(response) {
            callback(response, true);
        }, function(response) {
            callback(response, false);
        });
    }

    getCommentsByID(id, callback) {
        const options = {
            method: 'post',
            data: { "uid": this.uid, "token": this.token, "meme_id": id },
            headers: { }
        };

        this.http.sendRequest(this.getAPIUrl() + "getcomments", options, function(response) {
            callback(response, true);
        }, function(response) {
            callback(response, false);
        });
    }

    uploadMeme(base64, callback) {
        const options = {
            method: 'post',
            data: { "uid": this.uid, "token": this.token, "data": base64 },
            headers: { }
        };

        this.http.sendRequest(this.getUploadUrl(), options, function(response) {
            callback(response, true);
        }, function(response) {
            callback(response, false);
        });
    }

    requestSignIn() {

    }
}