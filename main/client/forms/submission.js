/* ----------------------- Form submission mixin ----------------------- */ 


SubmissionMixin = {
  prototype: {},
  state: {}
};

// formId
SubmissionMixin.prototype.formId = function () {
  return FlowRouter.getParam('formId');
};

// form obj
SubmissionMixin.prototype.formObj = function () {
  return FormBuilder.Collections.Forms.findOne({_id: this.formId()});
};

// is ready
SubmissionMixin.state.isReady = function () {
  return FlowRouter.subsReady();
};

/* ----------------------- Form submission detail mixin ----------------------- */ 


SubmissionDetailMixin = {
  state: {}
};

// submission object
SubmissionDetailMixin.state.object = function () {
  return FormBuilder.Collections.Submissions.findOne({_id: FlowRouter.getQueryParam('subId')});
};


/* ----------------------- Form submission delete ----------------------- */ 


var submissionDeleteComponent = FlowComponents.define('submissionDelete', function () {
});

// extend from submission mixins
submissionDeleteComponent.extend(SubmissionDetailMixin);
submissionDeleteComponent.extend(SubmissionMixin);

submissionDeleteComponent.state.templateNameToSearch = function () {
  var formObj = this.formObj();
  return 'SDelC' + formObj.code;
};

submissionDeleteComponent.action.onSubmit = function() {
  var formId = this.formId();
  var submissionId = FlowRouter.getQueryParam('subId');

  Meteor.call('submissionDelete', submissionId, function () {
    toastr.success('Ажилттай устлаа', 'Мэдэгдэл');
    FlowRouter.go('submissionList', {formId: formId});
  });
};

Template.submissionDelete.events({
  'submit form': function(evt) {
    evt.preventDefault();
    FlowComponents.callAction('onSubmit');
  }
});


/* ----------------------- Form submission detail ----------------------- */ 


var submissionDetailComponent = FlowComponents.define('submissionDetail', function () {
});

// extend from submission mixins
submissionDetailComponent.extend(SubmissionDetailMixin);
submissionDetailComponent.extend(SubmissionMixin);

submissionDetailComponent.state.templateNameToSearch = function () {
  var formObj = this.formObj();
  return 'SDetC' + formObj.code;
};



/* ----------------------- Form submission list ----------------------- */ 


var submissionList = Components.define('submissionList', function () {
});

submissionList.extend(SubmissionMixin);

submissionList.state.templateNameToSearch = function () {
  var formObj = this.formObj();
  return 'SLC' + formObj.code;
};

// main list
submissionList.state.objects = function () {
  FlowRouter.watchPathChange();

  // querystring param filters
  var params = FlowRouter.current().queryParams;
  params.formId = this.formId();

  var filterQueries = FormBuilder.LibHelpers.submissionListQuery(params);

  return FormBuilder.Collections.Submissions.find(filterQueries, {sort: {createdDate: -1}});
};
