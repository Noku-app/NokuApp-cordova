class Noku {

    init() {
        this.http = cordova.plugin.http;
        this.http.setDataSerializer(`json`);
        this.http.setRequestTimeout(5.0);

        this.memes = [null];
        this.userdat = {};
        this.users = [];
        this.version = `0.1.9C Beta`;
    }

    testToken(callback){
        const options = {
            method: `post`,
            data: { "token":this.token, "uid":this.uid },
            headers: {}
        };

        this.http.sendRequest(
            `${this.getAPIUrl()}tokencheck`, 
            options, 
            response => {
                callback(response, true);
            }, 
            response => {
                callback(response, false);
            }
        );
    }

    login(username, password, callback){
        let options = {
            method: `post`,
            data: { "username": username, "password": password },
            headers: { }
        };

        this.http.sendRequest(
            `${this.getAPIUrl()}login`, 
            options, 
            response => {
                callback(response, true);
            }, response => {
                callback(response, false);
            }
        );
    }

    register(username, password, email, callback){
        let options = {
            method: `post`,
            data: { "email": email, "username": username, "password": password },
            headers: { }
        };

        this.http.sendRequest(
            `${this.getAPIUrl()}register`, 
            options, 
            response => {
                callback(response, true);
            }, 
            response => {
                callback(response, false);
            }
        );
    }

    setCredentials(token, uid){
        this.token = token;
        this.uid = uid;
    }

    getMemes(type, callback){
        let api = ``;
        switch(type) {
            case 2: api = `getmemes`; break;
            default: api = `getdankmemes`; break;
        }


        let options = {
            method: `post`,
            data: { "uid": this.uid, "token": this.token },
            headers: { }
        };

        this.http.sendRequest(
            `${this.getAPIUrl()}${api}`, 
            options, 
            response => {
                callback(response, true);
            }, 
            response => {
                callback(response, false);
            }
        );
    }

    checkUpdate(updateCallback){
        let options = {
            method: 'post',
            data: { "uid": this.uid, "token": this.token, "version": this.version },
            headers: { }
        };

        this.http.sendRequest(
            this.getAPIUrl() + `${this.getAPIUrl()}checkupdate`, 
            options, 
            response => {
                let update = {};
                try {
                    update = JSON.parse(response.data).data;
                } catch (e){
                    update.update = false;
                    update.version = this.version;
                }
                if(update.update === true){
                    updateCallback(update);
                }
            },
            response => {}
        );
    }

    getMemesLimit(start, length, callback){
        let options = {
            method: `post`,
            data: {
                uid: this.uid,
                token: this.token,
                start: start,
                length: length,
            },
            headers: { }
        };

        this.http.sendRequest(
            `${this.getAPIUrl()}getmemeslimit`, 
            options, 
            response => {
                callback(response, true);
            }, 
            response => {
                callback(response, false);
            }
        );
    }

    getContent(url, callback){
        let options = {
            method: `post`,
            data: { },
            headers: { }
        };

        this.http.sendRequest(
            url, 
            options, 
            response => {
                callback(response, true);
            }, 
            response => {
                callback(response, false);
            }   
        );
    }

    sendError() {
        let options = {
            method: `post`,
            data: { "uid": this.uid, "token": this.token },
            headers: { }
        };

        this.http.sendRequest(
            `${this.getAPIUrl()}getmemes`, 
            options, response => {
                navigator.notification.alert(`Error report was sent successfully.`, () => {}, `Error Report`)
            }, () => {
                //console.log();
            }
        );
    }

    getBASEUrl() {
        return `https://noku.wtf`
    }

    getCDNUrl() {
        return `https://cdn.xemplarsoft.com/`;
    }

    getAPIUrl() {
        return `${this.getBASEUrl()}/api/`;
    }

    getUploadUrl() {
        return `${this.getBASEUrl()}/home/upload`;
    }

    getUploadUrlUrl() {
        return `${this.getBASEUrl()}/home/uploadurl`;
    }

    async getUserData(id, callback) {
        let options = {
            method: `post`,
            data: { "uid": this.uid, "token": this.token, "user_id": id },
            headers: { }
        };

        this.http.sendRequest(
            `${this.getAPIUrl()}getuserdata`, 
            options, 
            response => {
                let author;
                try {
                    author = JSON.parse(response.data).data;
                    author.valid = true;
                } catch (e) {
                    author = {};
                    author.valid = false;
                }
                callback(author);
            }, 
            response => {
                callback(response, false);
            }
        );
    }

    async getThisUser(callback) {
        let options = {
            method: `post`,
            data: { "uid": this.uid, "token": this.token, "user_id": this.uid },
            headers: { }
        };

        this.http.sendRequest(
            `${this.getAPIUrl()}getuserdata`, 
            options, 
            response => {
                let data;
                try {
                    data = JSON.parse(response.data);
                } catch (e){
                    data = {};
                    data.valid = false;
                }

                storage.setItem(`userdat`, JSON.stringify(data.data));
                callback();
        }, 
        response => {}
        );
    }

    async getAllLikes(id, callback){
        let options = {
            method: `post`,
            data: { "uid": this.uid, "token": this.token, "user_id": id },
            headers: { }
        };

        this.http.sendRequest(
            `${this.getAPIUrl()}getalllikes`, 
            options, 
            response => {
                callback(response, true);
            }, 
            response => {
                callback(response, false);
            }
        );
    }

    async getAllMemes(id, callback){
        let options = {
            method: `post`,
            data: { "uid": this.uid, "token": this.token, "user_id": id },
            headers: { }
        };

        this.http.sendRequest(
            `${this.getAPIUrl()}getallmemes`, 
            options, 
            response => {
                callback(response, true);
            }, 
            response => {
                callback(response, false);
            }   
        );
    }

    async getAllSubscribers(id, callback){
        let options = {
            method: `post`,
            data: { "uid": this.uid, "token": this.token, "user_id": id },
            headers: { }
        };

        this.http.sendRequest(
            this.getAPIUrl() + "getallsubs", options, function(response) {
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

    async getMemeData(id, callback){
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

    postComment(meme, content, replyTo, callback){
        const options = {
            method: 'post',
            data: { "uid": this.uid, "token": this.token, "meme": meme, "content":content, "replyTo": replyTo },
            headers: { }
        };

        this.http.sendRequest(this.getAPIUrl() + "postcomment", options, function(response) {
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

    likeComment(id, state, callback){
        const options = {
            method: 'post',
            data: { "uid": this.uid, "token": this.token, "id": id, "state":state },
            headers: { }
        };

        this.http.sendRequest(this.getAPIUrl() + "likecomment", options, function(response) {
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

    dislikeComment(id, state, callback){
        const options = {
            method: 'post',
            data: { "uid": this.uid, "token": this.token, "id": id, "state":state },
            headers: { }
        };

        this.http.sendRequest(this.getAPIUrl() + "dislikecomment", options, function(response) {
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

    uploadUrlMeme(url, callback) {
        const options = {
            method: 'post',
            data: { "uid": this.uid, "token": this.token, "url": url },
            headers: { }
        };

        this.http.sendRequest(this.getUploadUrlUrl(), options, function(response) {
            callback(response, true);
        }, function(response) {
            callback(response, false);
        });
    }

    getMemeIDFromURL(url, callback){
        const options = {
            method: 'post',
            data: { "uid": this.uid, "token": this.token, "url": url },
            headers: { }
        };

        this.http.sendRequest(this.getAPIUrl() + "getmemeidfromurl", options, function(response) {
            callback(response, true);
        }, function(response) {
            callback(response, false);
        });
    }

    /********************************
     * Settings Functions
     ********************************/
    
    settingPFP(link, callback){
        const options = {
            method: 'post',
            data: { "uid": this.uid, "token": this.token, "link": link },
            headers: { }
        };

        this.http.sendRequest(this.getAPIUrl() + "settingpfp", options, function(response) {
            callback(response, true);
        }, function(response) {
            callback(response, false);
        });
    }
}