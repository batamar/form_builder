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
  return value.split(separator);
});

Template.registerHelper('date', function(date, format) {
  return moment(date).format(format);
});


