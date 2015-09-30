/* ----------------------- common ui helpers ----------------------- */

Template.registerHelper('hasCustomTemplate', function(name) {
  var currentUser = Meteor.user();
  var customName = currentUser.username + name;
  return !_.isUndefined(Template[customName]);
});

Template.registerHelper('getCustomTemplateName', function(name) {
  var currentUser = Meteor.user();
  return {'name': currentUser.username + name};
});

Template.registerHelper('split', function(value, separator) {
  if (value) {
    return value.split(separator);
  }
});

Template.registerHelper('date', function(date, format) {
  return moment(date).format(format);
});

FormBuilder.Helpers.downloadFile = function (filename, text) {
  var element = document.createElement('a');

  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};

FormBuilder.Helpers.downloadCSVFile = function (filename, jsonList) {
  var csv = Papa.unparse(jsonList);
  return FormBuilder.Helpers.downloadFile(filename, csv);
};
