/* global FormBuilder */


/**
 * Form publications
 */


Meteor.publish('formList', function () {
  return FormBuilder.Collections.Forms.find({createdUser: this.userId});
});


Meteor.publish('formDetail', function(id) {
  check(id, String);

  return FormBuilder.Collections.Forms.find({createdUser: this.userId, _id: id});
});


/**
 * Field publications
 */


Meteor.publish('fieldList', function (formIds) {
  check(formIds, [String]);

  return FormBuilder.Collections.Fields.find({formId: {$in: formIds}}, {sort: {order: 1}});
});


/**
 * Submission publications
 */


Meteor.publish('submissionList', function (formId) {
  check(formId, String);

  return FormBuilder.Collections.Submissions.find({formId: formId});
});


Meteor.publish('submissionDetail', function (queryParams) {
  check(queryParams, Object);

  return FormBuilder.Collections.Submissions.find({_id: queryParams.subId});
});
