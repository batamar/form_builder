Picker.route('/form-template', function(params, req, res, next) {
  var fs = Npm.require('fs');
  var path = Npm.require('path');

  var absolutePath = path.resolve('../../../../../public');
  var filepath = path.join(absolutePath, 'form.html');

  fs.readFile(filepath, 'utf8', function(e, d){
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.end(d);
  });
});
