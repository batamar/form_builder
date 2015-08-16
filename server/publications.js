/* global FormBuilder */


/**
 * Form publications
 */


Meteor.publish('formList', function () {
  return FormBuilder.Collections.Forms.find();
});


Meteor.publish('formDetail', function(id) {
  check(id, String);

  return FormBuilder.Collections.Forms.find({_id: id});
});


/**
 * Field publications
 */


Meteor.publish('fieldList', function (formIds) {
  check(formIds, [String]);

  return FormBuilder.Collections.Fields.find({formId: {$in: formIds}});
});
