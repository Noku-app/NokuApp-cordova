function getInternalStorage(){
    return window.resolveLocalFileSystemURL(cordova.file.applicationDirectory);
}

function getFileHandle(id, path, handler, error){
    if(error == null) error = onIOError();
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {

        console.log('file system open: ' + fs.name);
        fs.root.getFile(path, { create: true, exclusive: false }, function (fileEntry) {
            handler(id, fileEntry);
        }, error(id));
    }, error(id));
}

function writeToFile(id, fileEntry, dataObj, success, error){
    fileEntry.createWriter(function (fileWriter) {
        fileWriter.onwriteend = function(e) {
            if(success != null) success();
            console.log("Successfully wrote to: " + e.toString());
        };

        fileWriter.onerror = function (e) {
            if(error != null) error();
            else(onIOError(id));
            console.log("Failed file write: " + e.toString());
        };

        if(dataObj != null) fileWriter.write(dataObj);
    });
}

function readFile(id, fileEntry, success, error) {
    if(error == null) error = onIOError(id)
    fileEntry.file(function (file) {
        var reader = new FileReader();

        reader.onloadend = function() {
            success(id, this.result);
        };
        reader.readAsArrayBuffer(file);
    }, error(id));
}

function onIOError(id){

}