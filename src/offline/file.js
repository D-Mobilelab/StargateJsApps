/*
* global Promise
* global stargateProtected
* */
/**
 * file namespace.
 * @namespace {Object} stargateProtected.file
 */

var file = (function(){
    /**
     * @namespace
     * @alias stargateProtected.file
     */
    var File = {};

    /**
     * ERROR_MAP
     * stargateProtected.file.ERROR_MAP
     * */
    File.ERROR_MAP = {
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
     * stargateProtected.file.resolveFS
     *
     * @param {String} url - the path to load see cordova.file.*
     * @returns {Promise<Entry|FileError>}
     * */
    File.resolveFS = function(url){
        return new Promise(function(resolve, reject){
            window.resolveLocalFileSystemURL(url, resolve, reject);
        });
    };

	/**
    * stargateProtected.file.appendToFile
    *
    * @param {String} filePath - the filepath file:// url like
    * @param {String} data - the string to write into the file
    * @param {string} [overwrite=false] - overwrite
    * @returns {Promise<String|FileError>} where string is a filepath
    */
    File.appendToFile = function(filePath, data, overwrite){
       //Default
       overwrite = arguments[2] === undefined ? false : arguments[2];
       return File.resolveFS(filePath)
            .then(function(fileEntry){

                return new Promise(function(resolve, reject){
                    fileEntry.createWriter(function(fileWriter) {
                        if(!overwrite){
                            fileWriter.seek(fileWriter.length);
                        }
                        var blob = new Blob([data], {type:'text/plain'});
                        fileWriter.write(blob);
                        fileWriter.onerror = reject;
                        fileWriter.onabort = reject;
                        fileWriter.onwriteend = function(){
                            resolve(__transform([fileEntry]));
                        };
                    }, reject);
                });

            });
    };

    /**
    * stargateProtected.file.readFileAsHTML
    * @param {String} indexPath - the path to the file to read
    * @returns {Promise<DOM|FileError>}
    */
    File.readFileAsHTML = function(indexPath){

       return File.readFile(indexPath)
        .then(function(documentAsString){
           return new window.DOMParser().parseFromString(documentAsString, "text/html");
        });
    };

    /**
     * stargateProtected.file.readFileAsJSON
     * @param {String} indexPath - the path to the file to read
     * @returns {Promise<Object|FileError>}
     */
    File.readFileAsJSON = function(indexPath){
        return File.readFile(indexPath)
            .then(function(documentAsString){
                try{
                    return Promise.resolve(window.JSON.parse(documentAsString));
                }catch(e){
                    return Promise.reject(e);
                }
            });
    };

     /**
     *  stargateProtected.file.removeFile
     *
     *  @param {String} filePath -
     *  @returns {Promise<String|FileError>}
     * */
     File.removeFile = function(filePath){
        return File.resolveFS(filePath)
            .then(function(fileEntry){
                return new Promise(function(resolve,reject){
                    fileEntry.remove(function(result){
                        resolve(result === null || result === "OK");
                    }, reject);
                });
            });
    };

    /**
     *  stargateProtected.file.removeDir
     *
     *  @param {String} dirpath - the directory entry to remove recursively
     *  @returns Promise<void|FileError>
     * */
    File.removeDir = function(dirpath){
        return File.resolveFS(dirpath)
            .then(function(dirEntry){
                return new Promise(function(resolve, reject){
                    dirEntry.removeRecursively(function(result){
                        resolve(result === null || result === "OK");
                    }, reject);
                });
            });
    };
    
    /**
     *  stargateProtected.file._promiseZip
     *
     *  @private
     *  @param {String} zipPath - the file to unpack
     *  @param {String} outFolder - the folder where to unpack
     *  @param {Function} _onProgress - the callback called with the percentage of unzip progress
     *  @returns Promise<boolean>
     * */
    File._promiseZip = function(zipPath, outFolder, _onProgress){

        console.log("PROMISEZIP:", arguments);
        return new Promise(function(resolve,reject){
            window.zip.unzip(zipPath, outFolder, function(result){
                if(result === 0){
                    resolve(true);
                }else{
                    reject(result);
                }
            }, _onProgress);
        });
    };

    /**
     * stargateProtected.file.download
     *
     * @param {String} url - the URL of the resource to download
     * @param {String} filepath - a directory entry type object where to save the file
     * @param {String} saveAsName - the name with the resource will be saved
     * @param {Function} _onProgress - a progress callback function filled with the percentage from 0 to 100
     * @returns {Promise}
     * */
    File.download = function(url, filepath, saveAsName, _onProgress){
        // one download at time for now
        var ft = new window.FileTransfer();
        ft.onprogress = _onProgress;
        File.currentFileTransfer = ft;

        return new Promise(function(resolve, reject){
           ft.download(window.encodeURI(url), filepath + saveAsName,
               function(entry){
                   resolve(__transform([entry]));
                   File.currentFileTransfer = null;
               },
               function(reason){
                   reject(reason);
                   File.currentFileTransfer = null;
               },
               true
           );
        });
    };

    /**
     * stargateProtected.file.createDir
     *
     * @param {String} dirPath - a file:// like path
     * @param {String} subFolderName
     * @returns {Promise<String|FileError>} - return the filepath created
     * */
    File.createDir = function(dirPath, subFolderName){
        return File.resolveFS(dirPath)
            .then(function(dirEntry){
                return new Promise(function(resolve, reject){
                    dirEntry.getDirectory(subFolderName, {create:true}, function(entry){
                        resolve(__transform([entry]));
                    }, reject);
                });
            });
    };

    /**
    *  stargateProtected.file.fileExists
    *
    *  @param {String} url - the toURL path to check
    *  @returns {Promise<boolean|void>}
    * */
    File.fileExists = function(url){
        return new Promise(function(resolve){
            window.resolveLocalFileSystemURL(url, function(entry){

                resolve(entry.isFile);

            }, function(fileError){
                resolve(fileError.code !== 1);
            });
        });
    };

    /**
     *  stargateProtected.file.dirExists
     *
     *  @param {String} url - the toURL path to check
     *  @returns {Promise<boolean|void>}
     * */
    File.dirExists = function(url){
        return new Promise(function(resolve){
            window.resolveLocalFileSystemURL(url, function(entry){

                resolve(entry.isDirectory);

            }, function(fileError){

                resolve(fileError.code != 1);
            });
        });
    };

    /**
     * stargateProtected.file.requestFileSystem
     *
     * @param {int} TYPE - 0 == window.LocalFileSystem.TEMPORARY or 1 == window.LocalFileSystem.PERSISTENT
     * @param {int} size - The size in bytes for example 5*1024*1024 == 5MB
     * @returns {Promise}
     * */
    File.requestFileSystem = function(TYPE, size) {
        return new Promise(function (resolve, reject) {
            window.requestFileSystem(TYPE, size, resolve, reject);
        });
    };

    /**
     * stargateProtected.file.readDir
     *
     * @param {String} dirPath - a directory path to read
     * @returns {Promise<Array>} - returns an array of Object files
     * */
    File.readDir = function(dirPath){
        return File.resolveFS(dirPath)
            .then(function(dirEntry){
                return new Promise(function(resolve, reject){
                    var reader = dirEntry.createReader();
                    reader.readEntries(function(entries){
                        resolve(__transform(entries));
                    }, reject);
                });
            });
    };

    /**
    * stargateProtected.file.readFile
    * @param {String} filePath - the file entry to readAsText
    * @returns {Promise<String|FileError>}
    */
    File.readFile = function(filePath) {

        return File.resolveFS(filePath)
            .then(function(fileEntry){
                return new Promise(function(resolve, reject){
                    fileEntry.file(function(file) {
                        var reader = new FileReader();
                        reader.onerror = reject;
                        reader.onabort = reject;

                        reader.onloadend = function() {
                            var textToParse = this.result;
                            resolve(textToParse);
                        };
                        reader.readAsText(file);
                        //readAsDataURL
                        //readAsBinaryString
                        //readAsArrayBuffer
                    });
                });
            });
    };

    /**
     * stargateProtected.file.createFile
     *
     * @param {String} directory - filepath file:// like string
     * @param {String} filename - the filename including the .txt
     * @returns {Promise.<FileEntry|FileError>}
     * */
    File.createFile = function(directory, filename){
        return File.resolveFS(directory)
            .then(function(dirEntry){
                return new Promise(function(resolve, reject){
                    dirEntry.getFile(filename, {create:true}, function(entry){
                        resolve(__transform([entry]));
                    }, reject);
                });
            });
    };

    File.write = function(filepath, content){
        return File.appendToFile(filepath, content, true);
    };

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
                internalURL:entry.toInternalURL(),
                isFile:entry.isFile,
                isDirectory:entry.isDirectory
            };
        });
    }

    return File;

})();

module.exports = file;