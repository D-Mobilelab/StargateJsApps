describe("File modules tests", function() {

  function logFail(){
    console.log(arguments);
  }

  var TEST_FOLDER_DIR,
      STORAGE_DIR,
      TEST_FOLDER_NAME = "Test";


  function removeTestFolder(done){
    window.resolveLocalFileSystemURL(TEST_FOLDER_DIR,
    function(dirEntry){
      dirEntry.removeRecursively(function(result){
        console.log(result);
        done();
      },function(err){
        console.log(err);
        done();
      });
    },
    function(err){
      console.log(err);
      done();
    });
  }

  function createTestFolder(done){
    window.resolveLocalFileSystemURL(STORAGE_DIR,
    function(dirEntry){
      dirEntry.getDirectory(TEST_FOLDER_NAME, {create:true},
         function(entry){
           console.log(entry);
           done();
      }, function(err){
            console.log(err);
            done();
         }
      );
    },
    function(err){
      console.log(err);
      done();
    });
  }

  function createFile(name){
    return new Promise(function(resolve, reject){
      window.resolveLocalFileSystemURL(
          TEST_FOLDER_DIR,
          function(dirEntry){
            dirEntry.getFile(name, {create:true}, resolve);
          },
          function(err){
            console.log(err);
          }
      );
    });
  }

  function createFileWithContent(name, content){
    return createFile(name)
      .then(function(fileEntry){
        return new Promise(function(resolve,reject){
          fileEntry.createWriter(function(fw){
            fw.seek(fw.length);
            var blob = new Blob([content], {type:'text/plain'});
            fw.write(blob);
            fw.onwriteend = function(){
              resolve(fileEntry);
            }
          });
        });
      });
  }

  beforeAll(function(done) {
    document.addEventListener("deviceready", function(){
      STORAGE_DIR = cordova.file.applicationStorageDirectory;
      TEST_FOLDER_DIR = [cordova.file.applicationStorageDirectory, TEST_FOLDER_NAME].join("");
      createTestFolder(done);
    });
  });

  beforeEach(function(done) {
    createTestFolder(done);
  });

  afterEach(function(done) {
    removeTestFolder(done);
  });

  it("file module should exists", function() {
    expect(file).toBeDefined();

  });

  it("file.createDir should return the Test path created", function(done) {

      expect(file.createDir).toBeDefined();
      expect(STORAGE_DIR).not.toBeNull();
      file.createDir(STORAGE_DIR, TEST_FOLDER_NAME)
         .then(function(result){
            expect(result).toContain("Test");
            expect(typeof result).toBe("string");
            done();

         }).catch(function(err){
            console.log(err);
            done();
         });

  });

  it("file.removeDir should remove the Test path", function(done) {

      expect(file.removeDir).toBeDefined();

      file.dirExists(TEST_FOLDER_DIR) //beforeEach have to create a new one every time
          .then(function(result){
            expect(result).toBe(true);

          })
          .then(function(){
            return file.removeDir(TEST_FOLDER_DIR);
          })
          .then(function(result){
            expect(result).toBe("OK");
            done();
          }).catch(function(err){
            console.log(err);
            done();
          });

  });

  it("file.readDir should return an empty array", function(done) {

      file.createDir(STORAGE_DIR, TEST_FOLDER_NAME)
          .then(file.readDir)
          .then(function(entries){
            expect(entries.length).toEqual(0);
            done();
          }).catch(function(err){
            console.log(err);
            done();
          });

  });

  it("file.readDir should return a non-empty array of Entries", function(done) {
      file.readDir(STORAGE_DIR)
          .then(function(entries){
            expect(entries.length).not.toEqual(0);
            expect(entries[0].isFile).toBeDefined();
            expect(entries[0].isDirectory).toBeDefined();
            expect(entries[0].path).toBeDefined();
            done();
          }).catch(function(err){
            console.log(err);
            done();
          });
  });

  it("file.createFile should create a file in STORAGE dir folder", function(done) {

    file.createFile(TEST_FOLDER_DIR, "filename.txt")
        .then(function(newFiles){
          var _n = newFiles[0];
          expect(_n.path).toContain("filename.txt");
          expect(_n.isFile).toBe(true);
          expect(_n.isDirectory).toBe(false);
          done();
        })
        .catch(function(err){
          console.log(err);
          done();
        });
  });

  it("file.removeFile should remove a file in TEST_FOLDER_DIR", function(done) {
      createFile("filename.txt")
          .then(function(result){
            return result.toURL();
          })
          .then(function(path){
            return file.removeFile(path);
          })
          .then(function(result){
            expect(result).toEqual("OK");
            done();
          }).catch(function(err){
            console.log(err);
          });
  });

  it("file.removeFile should fail if the filepath not exists", function(done) {
      var path = STORAGE_DIR + "filename.txt";
      file.removeFile(path).then(function(result){

        console.log("should not go here", result);
        done();
      }).catch(function(err){
        expect(err.code).toEqual(1);
        done();
      });
  });

  it("file.readFile should NOT read a file", function(done) {
    file.readFile(STORAGE_DIR + "filename.txt")
        .then(function(result){
        })
        .catch(function(err){
          expect(err.code).toBe(1);
          done();
        });
  });

  it("file.readFile should read the content of a file", function(done) {
    createFileWithContent("filename.txt", "the content to write")
        .then(function(fileEntry){
          return fileEntry.toURL();
        })
        .then(file.readFile)
        .then(function(content){
          expect(content).toEqual("the content to write");
          done();
        });
  });
});

/*

file.createDir(dirpath, subdir); OK
file.removeDir(dirpath); OK
file.readDir(dirpath); OK

file.createFile(dirpath, filename); OK
file.removeFile(filepath); OK
file.readFile(filepath); OK

file.appendToFile(filepath, data);

*/



