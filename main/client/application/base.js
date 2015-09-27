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

/* ----------------------- default layout ----------------------- */

Template.mainLayout.helpers({
  test: function () {
    console.log('in mainLayout"s test helper');
    console.log(Template.batamarLayout);
  }
});

var defaultLayout = FlowComponents.define('defaultLayout', function (props) {
  this.set('content', props.content);

  this.onRendered(function () {
    Meteor.subscribe('formList');
  });
});


defaultLayout.state.forms = function () {
  return FormBuilder.Collections.Forms.find({isSub: false});
};
