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

    getCDNUrl() {
        return "https://cdn.xemplarsoft.com/";
    }

    getAPIUrl() {
        return "https://xemplarsoft.com/noku/api/";
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

    getCommentsByID(id) {
        let comments = [];

        switch (id) {
            case 21:
                comments.push({
                    id: 1,
                    authorID: 1,
                    replyTo: -1,
                    likes: 1,
                    dislikes: 0,
                    content: "This is a test comment."
                });
                comments.push({
                    id: 2,
                    authorID: 2,
                    replyTo: -1,
                    likes: 3,
                    dislikes: 1,
                    content: "This is a test comment from a different person."
                });
                comments.push({
                    id: 3,
                    authorID: 1,
                    replyTo: 2,
                    likes: 2,
                    dislikes: 0,
                    content: "This is a reply comment to the second one."
                });
                comments.push({
                    id: 4,
                    authorID: 2,
                    replyTo: 3,
                    likes: 0,
                    dislikes: 0,
                    content: "Yr a bitch."
                });
                break;

            case 25:
                comments.push({
                    id: 5,
                    authorID: 1,
                    replyTo: -1,
                    likes: 1,
                    dislikes: 0,
                    content: "Second set of test comments."
                });
                comments.push({
                    id: 6,
                    authorID: 2,
                    replyTo: 5,
                    likes: 3,
                    dislikes: 1,
                    content: "This should be the second comment that appears."
                });
                comments.push({
                    id: 7,
                    authorID: 1,
                    replyTo: -1,
                    likes: 2,
                    dislikes: 0,
                    content: "This should be the last even though its the third in sequence"
                });
                comments.push({
                    id: 8,
                    authorID: 2,
                    replyTo: 6,
                    likes: 0,
                    dislikes: 0,
                    content: "This should be number 3 even though its fourth in the data set."
                });
                break;
        }

        return comments;
    }

    requestSignIn() {

    }
}