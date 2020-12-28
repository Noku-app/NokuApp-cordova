class Noku {

    init(){
        this.http = cordova.plugin.http;
        this.http.setDataSerializer('json');
        this.http.setRequestTimeout(5.0);
    }

    testToken(token, callback){
        const options = {
            method: 'post',
            data: { "token": token },
            headers: { }
        };

        this.http.sendRequest(this.getAPIUrl() + "tokencheck", options, function(response) {
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

    getUserData(id) {
        //TODO Implement getUserData()

        var user = {};
        switch (id) {
            case 1:
                user.pfp = "6CC8ABAEA14F822667CAA621E94200F14F151DBB8A479A25218EEAD6C1388403";
                user.name = "The Next Guy";
                user.color = "#5020F0";
                break;
            case 2:
                user.pfp = "6D9BC53912E4F1133052B98406BBD2AF0929F8C5AB78C61FCBD79C8D43CF377E";
                user.name = "Defy";
                user.color = "#802020";
                break;
        }
        return user;
    }

    getMemeIDByHash(hash) {
        //TODO Implement GetMemeIDByHash

        //Pseudo code just to let it run
        let memes = ['6261FE583B7797C7A0901A1ADFF4A4782EE1480F38D2C90322F27DBD726C2609', '03B2095B05C892EC91E8545E7EE7520F9E02692A4379B9099AA7EF0AB72F7AE8', 'D25FA9E39679FD4DAF01D8F9A00B0E57B4CE78692C81BE115C2AB3A205620F6F', 'E8F0071EC973CDE24A05BA641FA4DBEE214027E9C060133A14684A73FB7E2767'];
        switch (hash) {
            case memes[0]:
                return 21;
            case memes[1]:
                return 25;
            case memes[2]:
                return 26;
            case memes[3]:
                return 31;
            default:
                return 0;
        }
    }

    getMemeByID(id) {
        let meme = {};

        switch (id) {
            case 21:
                meme.hash = "6261FE583B7797C7A0901A1ADFF4A4782EE1480F38D2C90322F27DBD726C2609";
                meme.author = 1;
                meme.likes = 421;
                meme.dislikes = 68;
                break;

            case 25:
                meme.hash = "03B2095B05C892EC91E8545E7EE7520F9E02692A4379B9099AA7EF0AB72F7AE8";
                meme.author = 2;
                meme.likes = 687;
                meme.dislikes = 21;
                break;

            case 26:
                meme.hash = "D25FA9E39679FD4DAF01D8F9A00B0E57B4CE78692C81BE115C2AB3A205620F6F";
                meme.author = 1;
                meme.likes = 87;
                meme.dislikes = 11;
                break;

            case 31:
                meme.hash = "E8F0071EC973CDE24A05BA641FA4DBEE214027E9C060133A14684A73FB7E2767";
                meme.author = 1;
                meme.likes = 102;
                meme.dislikes = 21;
                break;
        }

        return meme;
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