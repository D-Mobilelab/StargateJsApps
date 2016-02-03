/* global Promise */
(function(parent){

    var ERROR_MAP = {
        1:"NOT_FOUND_ERR",
        2:"SECURITY_ERR",
        3:"ABORT_ERR",
        4:"NOT_READABLE_ERR",
        5:"ENCODING_ERR",
        6:"NO_MODIFICATION_ALLOWED_ERR",
        7:"INVALID_STATE_ERR",
        8:"SYNTAX_ERR",
        9:"INVALID_MODIFICATION_ERR",
        10:"QUOTA_EXCEEDED_ERR",
        11:"TYPE_MISMATCH_ERR",
        12:"PATH_EXISTS_ERR"
    };

	/**
    * appendToFile
    * @param {FileEntry} fileEntry - the file entry to write
    * @data {String}
    * @returns Promise<FileEntry|FileError>
    */
    function appendToFile(fileEntry, data){
        return new Promise(function(resolve, reject){
            fileEntry.createWriter(function(fileWriter) {

                fileWriter.seek(fileWriter.length);

                var blob = new Blob([data], {type:'text/plain'});
                fileWriter.write(blob);
                fileWriter.onwriteend = function(){
                    resolve(fileEntry);
                };
            }, reject);
        });
    }

    /**
    * readHTMLFile
    * @param {String} indexPath - the path to the file to read
    * @returns Promise<DOM|FileError>
    */
    function readHTMLFile(indexPath){
        return resolveFS(indexPath)
        .then(readFile)
        .then(function(documentAsString){
           var dom = new window.DOMParser().parseFromString(documentAsString, "text/html");
           return dom;
        });

    }

     /**
     *  removeFile
     *
     *  @param {String} filePath -
     *  @returns Promise<String|FileError>
     * */
    function removeFile(filePath){
        return resolveFS(filePath)
            .then(function(fileEntry){
                return new Promise(function(resolve,reject){
                    fileEntry.remove(resolve, reject);
                });
            });
    }

    /**
     *  removeDir
     *
     *  @param {String} dirpath - the directory entry to remove recursively
     *  @returns Promise<void|FileError>
     * */
    function removeDir(dirpath){
        return resolveFS(dirpath)
            .then(function(dirEntry){
                return new Promise(function(resolve, reject){
                    dirEntry.removeRecursively(resolve, reject);
                });
            });
    }

    /**
     *  _promiseZip
     *
     *  @private
     *  @param {String} zipPath - the file to unpack
     *  @param {String} outFolder - the folder where to unpack
     *  @param {Function} _onProgress - the callback called with the percentage of unzip progress
     *  @returns Promise<boolean>
     * */
    function _promiseZip(zipPath, outFolder, _onProgress){
        return new Promise(function(resolve,reject){
            window.zip.unzip(zipPath, outFolder, function(result){
                if(result == 0){
                    resolve(true);
                }else{
                    reject(result);
                }
            }, _onProgress);
        });
    }

    /**
     * download
     *
     * @param {String} url - the URL of the resource to download
     * @param {DirectoryEntry} dirEntry - a directory entry type object where to save the file
     * @param {String} saveAsName - the name with the resource will be saved
     * @param {Function} _onProgress - a progress callback function filled with the percentage from 0 to 90
     * */
    function download(url, dirEntry, saveAsName, _onProgress){
        var ft = new window.FileTransfer();
        ft.onprogress = _onProgress;
        return new Promise(function(resolve, reject){
           ft.download(window.encodeURI(url), dirEntry.toInternalURL() + saveAsName, resolve, reject);
        });
    }

    /**
     * createDir
     *
     * @param {String} dirPath - a file:// like path
     * @param {String} subFolderName
     * @returns Promise<String|FileError> - return the filepath created
     * */
    function createDir(dirPath, subFolderName){
        return resolveFS(dirPath)
            .then(function(dirEntry){
                return new Promise(function(resolve, reject){
                    dirEntry.getDirectory(subFolderName, {create:true}, function(entry){
                        resolve(entry.toURL());
                    }, reject);
                });
            });
    }

    /**
    *  fileExists
    *
    *  @param {String} url - the toURL path to check
    *  @returns Promise<boolean|void>
    * */
    function fileExists(url){
        return new Promise(function(resolve, reject){
            window.resolveLocalFileSystemURL(url, function(entry){

                resolve(entry.isFile);

            }, function(fileError){
                resolve(!(fileError.code == 1));
            });
        });
    }

    /**
     *  dirExists
     *
     *  @param {String} url - the toURL path to check
     *  @returns Promise<Boolean|void>
     * */
    function dirExists(url){
        return new Promise(function(resolve, reject){
            window.resolveLocalFileSystemURL(url, function(entry){

                resolve(entry.isDirectory);

            }, function(fileError){
                resolve(!(fileError.code == 1));
            });
        });
    }

    /**
     * resolveFS
     *
     * @param {String} url - the path to load see cordova.file.*
     * @returns Promise<Entry|FileError>
     * */
    function resolveFS(url) {
        return new Promise(function(resolve, reject){
            window.resolveLocalFileSystemURL(url, resolve, reject);
        });
    }

    /**
     * requestFileSystem
     *
     * @param {int} TYPE - 0 == window.LocalFileSystem.TEMPORARY or 1 == window.LocalFileSystem.PERSISTENT
     * @param {int} size - The size in bytes for example 5*1024*1024 == 5MB
     * @returns {Promise}
     * */
    function requestFileSystem(TYPE, size) {
        return new Promise(function (resolve, reject) {
            window.requestFileSystem(TYPE, size, resolve, reject);
        });
    }

    /**
     * readDir
     *
     * @param {String} dirPath - a directory path to read
     * @returns Promise<Array> - returns an array of Object files
     * */
    function readDir(dirPath){
        return resolveFS(dirPath)
            .then(function(dirEntry){
                return new Promise(function(resolve, reject){
                    var reader = dirEntry.createReader();
                    reader.readEntries(function(entries){
                        resolve(__transform(entries));
                    }, reject);
                });
            });
    }

    /**
    * readFile
    * @param {String} filePath - the file entry to readAsText
    * @returns Promise<String|FileError>
    */
    function readFile(filePath) {
        return resolveFS(filePath)
            .then(function(fileEntry){
                return new Promise(function(resolve, reject){
                    fileEntry.file(function(file) {
                        var reader = new FileReader();

                        reader.onloadend = function(e) {
                            resolve(this.result);
                        };
                        reader.readAsText(file);
                    });
                });
            });
    }

    /**
     * createFile
     *
     * @param {String} directory - filepath file:// like string
     * @param {String} filename - the filename including the .txt
     * @returns Promise<FileEntry|FileError>
     * */
    function createFile(directory, filename){
        return resolveFS(directory)
            .then(function(dirEntry){
                return new Promise(function(resolve, reject){
                    dirEntry.getFile(filename, {create:true}, function(entry){
                        resolve(__transform([entry]));
                    }, reject);
                });
            });
    }

    /**
     * __transform utils function
     * @private
     * @param {Array} entries - an array of Entry type object
     * @returns {Array.<Object>} - an array of Object
     * */
    function __transform(entries){
        return entries.map(function(entry){
            return {
                path:entry.toURL(),
                isFile:entry.isFile,
                isDirectory:entry.isDirectory
            }
        });
    }

    return {
        createFile:createFile,
    	appendToFile:appendToFile,
    	readFile:readFile,
    	removeFile:removeFile,
    	readDir:readDir,
    	createDir:createDir,
    	removeDir:removeDir,
    	resolveFS:resolveFS,
    	fileExists:fileExists,
        dirExists:dirExists,
    	download:download
    }

})();