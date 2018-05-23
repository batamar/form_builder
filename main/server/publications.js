/* global FormBuilder */


// common helpers for given users's created forms
var availableFormIds = function (userId) {
  return _.pluck(FormBuilder.Collections.Forms.find({createdUser: userId}, {fields: {_id: 1}}).fetch(), '_id');
};


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


// pubication for forms api
Meteor.publish('publicForms', function () {
  return FormBuilder.Collections.Forms.find({isPublic: true});
});


/**
 * Field publications
 */


Meteor.publish('fieldList', function (formIds) {
  check(formIds, [String]);

  var selector = {
    $and: [
      {formId: {$in: formIds}},
      {formId: {$in: availableFormIds(this.userId)}}
    ]
  };

  return FormBuilder.Collections.Fields.find(selector, {sort: {order: 1}});
});


// pubication for fields api
Meteor.publish('publicFormFields', function (formIds) {
  check(formIds, [String]);

  // add is public to given filter. then it will return only public ones.
  var publicForms = FormBuilder.Collections.Forms.find({$and: [{_id: {$in: formIds}}, {isPublic: true}]}, {fields: {_id: 1}});
  var publicFormIds = _.pluck(publicForms.fetch(), '_id');

  return FormBuilder.Collections.Fields.find({formId: {$in: publicFormIds}});
});


/**
 * Submission publications
 */

Meteor.publish('submissionList', function (formId) {
  check(formId, String);

  return FormBuilder.Collections.Submissions.find({$and: [{formId: {$in: availableFormIds(this.userId)}}, {formId: formId}]}, {sort: {createdDate: -1}});
});


Meteor.publish('submissionDetail', function (queryParams) {
  check(queryParams, Object);

  return FormBuilder.Collections.Submissions.find({$and: [{formId: {$in: availableFormIds(this.userId)}}, {_id: queryParams.subId}]});
});
