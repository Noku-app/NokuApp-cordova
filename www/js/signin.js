document.addEventListener('deviceready', onDeviceReady, false);
let noku = new Noku();
let storage = window.localStorage;

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);

    noku.init();

    $(".btn").click(function (e){
        handleClick(e);
    });

}

function handleClick(e){
    var btn = $(e.target);
    var method = btn.data("command");

    if(method === "login") login();
    if(method === "register") register();
}

function login(){
    let user = $("#username").val();
    let pass = $("#password").val();

    noku.login(user, pass, handleLogin);
}

function register(){
    let email = $("#email").val();
    let user = $("#username").val();
    let pass = $("#password").val();
    let conf = $("#confirm").val();

    if(user === undefined || email === undefined || pass === undefined || conf === undefined ||
        user == null || email == null || pass == null || conf == null){
        navigator.notification.alert(
            "One of the fields was left blank. Please fill out the whole form.",
            null,
            "Register Error",
            "Okay"
        );
        return;
    }

    if(!validateEmail(email)){
        navigator.notification.alert(
            "Your email isn't in a valid format.",
            null,
            "Register Error",
            "Okay"
        );
        return;
    }

    if(user.length < 3){
        navigator.notification.alert(
            "Your username must be 3 characters or longer.",
            null,
            "Register Error",
            "Okay"
        );
        return;
    }

    //Password Validation
    let errors = [];
    var count = 0;
    if(!validatePassword(pass, 0)) errors[count++] = "Password must contain 1 lower case letter";
    if(!validatePassword(pass, 1)) errors[count++] = "Password must contain 1 uppercase case letter";
    if(!validatePassword(pass, 2)) errors[count++] = "Password must contain 1 number";
    if(!validatePassword(pass, 3)) errors[count++] = "Password must contain 1 special character";
    if(!validatePassword(pass, 4)) errors[count++] = "Password must be at lease 12 characters long";

    if(count > 1){
        navigator.notification.alert(
            errors.join(",\n"),
            null,
            "Register Error",
            "Okay"
        );
        return;
    }

    if(pass !== conf){
        navigator.notification.alert(
            "Passwords do not match.",
            null,
            "Register Error",
            "Okay"
        );
        return;
    }

    noku.register(user, pass, email, handleRegister);
}


function handleLogin(response){
    var data;
    try {
        data = JSON.parse(response.data);
    } catch (e){
        data = {};
        data.error = true;
        data.message = response.data;
    }

    if(data.error === false){
        storage.setItem("auth_token", data.data.message.token);
        storage.setItem("uid", data.data.message.uid);

        tokenCheck();
    } else {
        $("#password").val("");
        navigator.notification.alert("Username or password Incorrect.", null, "Login Error", "Okay");
    }
}

function handleRegister(response){
    var data;
    try {
        data = JSON.parse(response.data);
    } catch (e){
        data = {};
        data.error = true;
        data.message = response.data;
    }

    if(data.error === false){
        storage.setItem("auth_token", data.data.message.token);
        storage.setItem("uid", data.data.message.uid);

        tokenCheck();
    } else {
        alert(JSON.stringify(response));

        navigator.notification.alert("Username or password incorrect.", null, "Register Error", "Okay");
    }
}

function requestErrorLog(error){
    navigator.notification.confirm("An error has occurred, would you like to send a message to the Noku staff?", function (choice){
        if(choice === 1){
            noku.sendError(error);
        }
    }, "Error Report", ['No', 'Yes']);
}

function tokenCheck(){
    let token = storage.getItem("auth_token");
    let uid = storage.getItem("uid");
    if(token == null || uid == null){
        redirect("signin.html");
        return;
    }
    noku.setCredentials(token, uid);
    noku.testToken(handleTokenCheck)
}

function handleTokenCheck(response, worked){
    console.log(worked);
    console.log(response);
    var data;
    try {
        data = JSON.parse(response.data);
    } catch (e){
        data = {};
        data.valid = false;
    }

    if(data.valid === true){
        redirect("index.html");
    } else {
        navigator.notification.alert("An unknown error has occurred. Please notify Noku Staff",
            null,
            "Verification Error",
            "Okay"
        );
    }
}

function redirect(page){
    $("body").fadeOut(100, function(){
        window.location.href = page;
    });
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validatePassword(pass){
    var re = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{12,})");
    return re.test(String(pass));
}

function validatePassword(pass, step){
    var re;
    switch (step){
        case 0:
            re = new RegExp("^(?=.*[a-z])");
            break;
        case 1:
            re = new RegExp("^(?=.*[A-Z])");
            break;
        case 2:
            re = new RegExp("^(?=.*[0-9])");
            break;
        case 3:
            re = new RegExp("^(?=.*[!@#\$%\^&\*])");
            break;
        case 4:
            re = new RegExp("^(?=.{12,})");
            break;
    }
    return re.test(String(pass));
}