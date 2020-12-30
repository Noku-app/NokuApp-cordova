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
let noku = new Noku();
let storage = window.localStorage;

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    noku.init();

    $(".btn").click(function (e){
        handleClick(e);
    });

    checkSignedIn();
}

function checkSignedIn(){
    let token = storage.getItem("auth_token");
    let uid = storage.getItem("uid");
    if(token == null || uid == null){
        redirect("signin.html");
        return;
    }

    // Test Token
    noku.setCredentials(token, uid);
    noku.testToken(handleTokenCheck);
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

    redirect(data.valid === true ? "index.html" : "signin.html");
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

function handleClick(e){
    var btn = $(e.target);
    var method = btn.data("command");

    if(method === "repub") {}
}

function setup(){

}