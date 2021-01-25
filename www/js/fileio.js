const getInternalStorage = () => {
    return window.resolveLocalFileSystemURL(cordova.file.applicationDirectory);
}

const getFileHandle = (id, path, handler, error) => {
        if(!error) {
            error = onIOError(id);
        };
        window.requestFileSystem(
            LocalFileSystem.PERSISTENT, 
            0, 
            fs => {
                console.log(`file system open: ${fs.name}`);
                fs.root.getFile(
                    path, 
                    { create: true, exclusive: false }, 
                    fileEntry => {
                        handler(id, fileEntry);
                    }, 
                    error(id)
                );
        }, error(id)
    );
}

const writeToFile = (id, fileEntry, dataObj, success, error) => {
    fileEntry.createWriter(
        fileWriter => {

            fileWriter.onwriteend = err => {
                if(success) {
                    success();
                }; console.log(`Successfully wrote to: ${err.toString()}`);
            };

            fileWriter.onerror = err => {
                if(err) {
                    error()
                } else {
                    onIOError(id)
                }; console.log(`Failed file write: ${err.toString()}`);
            };

            if(!dataObj) {
                fileWriter.write(dataObj);
            }
        }
    );
};

const readFile = (id, fileEntry, success, error) => {
    if(!error) {
        error = onIOError(id);
    };
    fileEntry.file(
        file => {
            var reader = new FileReader();
            reader.onloadend = () => {
                alert(this.result);
                success(id, this.result);
            };
            reader.readAsText(file);
        }, 
        error(id)
    );
}

const onIOError = id => {

}