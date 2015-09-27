loadTemplates = function (username, callback) {
  Meteor.call('loadTemplates', username, function (error, templates) {
    _.each(templates, function (template) {
      if (_.isUndefined(Template[template.name])) {
        var compiled = SpacebarsCompiler.compile(template.content, {isTemplate: true});
        var rendered = eval(compiled);
        Template.__define__(template.name, rendered);
      }
    });

    callback();
  });
};

Meteor.startup(function () {
  var user = Meteor.user();
  if (user) {
    loadTemplates(user.username, function () {});
  }
});
