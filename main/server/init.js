Meteor.startup(function () {
  UploadServer.init({
    tmpDir: process.env.PWD + '/.uploads/tmp',
    uploadDir: process.env.PWD + '/.uploads',
    checkCreateDirectories: true,
    maxFileSize: 5000000,
    getDirectory: function(fileInfo, formData) {
      return formData.domain;
    },
  });
});
