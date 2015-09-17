/* ----------------------- Form LIST ----------------------- */


var formListComponet = FlowComponents.define('formList', function () {});

formListComponet.state.objects = function () {
  return FormBuilder.Collections.Forms.find();
};


/* ----------------------- Field generate ----------------------- */


ComponentFieldGenerate = {
  prototype: {},
  action: {},
  state: {}
};

// form id
ComponentFieldGenerate.state.formId = function () {
  return FlowRouter.getParam('formId');
};

// form object
ComponentFieldGenerate.state.object = function () {
  return FormBuilder.Collections.Forms.findOne({_id: this.get('formId')});
};

// form fields
ComponentFieldGenerate.state.fields = function () {
  return FormBuilder.Collections.Fields.find({formId: this.get('formId')}, {sort: {order: 1}});
};



/* ----------------------- Form CREATE && UPDATE ----------------------- */ 


var formCUComponet = Components.define('formCU', function () {
  var formId = this.get('formId');

  this.onReady(function() {
    /*
     * sort
     */

    var list = $('.field-list');

    list.sortable({
      handle: 'label',
      items: '.field',
      tolerance: '> div',
      opacity: 0.7,
      forcePlaceholderSize: true,
      update: function (e, ui) {
        list.sortable('disable');

        // collect by orders
        var orders = {};
        $('.field').each(function (index) {
          orders[$(this).data('id')] = index;
        });

        Meteor.call('updateFieldOrder', formId, orders, function (error) {
          if (error) {
            toastr.error(error.reason, 'Алдаа');
          } else {
            toastr.success('Мэдэгдэл', 'Амжилттай хадгаллаа');
          }

          list.sortable('enable');
        });
      }
    });

    if (formId) {
      this.set('af', {type: 'method-update', method: 'formUpdate'});

    } else {
      this.set('af', {type: 'method', method: 'formInsert'});
    }
  });
});

// extend from common field generate
formCUComponet.extend(ComponentFieldGenerate);



/* ----------------------- Form delete ----------------------- */ 


var formDeleteComponent = FlowComponents.define('formDelete', function () {
  this.formId = FlowRouter.getParam('formId');
});

formDeleteComponent.state.object = function () {
  return FormBuilder.Collections.Forms.findOne({_id: this.formId});
};

formDeleteComponent.action.onSubmit = function() {
  var formId = this.formId;

  Meteor.call('formDelete', formId, function () {
    toastr.success('Ажилттай устлаа', 'Мэдэгдэл');
    FlowRouter.go('forms');
  });
};

Template.formDelete.events({
  'submit form': function(evt) {
    evt.preventDefault();
    FlowComponents.callAction('onSubmit');
  }
});



/* ----------------------- Form submission detail mixin ----------------------- */ 


SubmissionDetailMixin = {
  prototype: {},
  action: {},
  state: {}
};

// submission object
SubmissionDetailMixin.state.object = function () {
  return FormBuilder.Collections.Submissions.findOne({_id: FlowRouter.getQueryParam('subId')});
};

SubmissionDetailMixin.state.getKeysAndValues = function() {
  var submission = this.get('object');

  // after deletion this function is reruning. So since submission object is deleted, submission must be undefined
  if (!submission) {
    return [];
  }

  var form = FormBuilder.Collections.Forms.findOne({_id: this.formId});

  // getting sorted form fields
  var fields = FormBuilder.Collections.Fields.find({formId: this.formId}).fetch();
  var categoryFields = FormBuilder.LibHelpers.formFieldsByOrder(fields);

  // return submission values with labels
  return FormBuilder.LibHelpers.submissionValuesWithLabels(submission, fields);
};



/* ----------------------- Form submission delete ----------------------- */ 


var formSubmissionDeleteComponent = FlowComponents.define('formSubmissionDelete', function () {
  this.formId = FlowRouter.getParam('formId');
});

// extend from submission detail mixin
formSubmissionDeleteComponent.extend(SubmissionDetailMixin);

formSubmissionDeleteComponent.action.onSubmit = function() {
  var formId = this.formId;
  var submissionId = FlowRouter.getQueryParam('subId');

  Meteor.call('submissionDelete', submissionId, function () {
    toastr.success('Ажилттай устлаа', 'Мэдэгдэл');
    FlowRouter.go('formSubmissionList', {formId: formId});
  });
};

Template.formSubmissionDelete.events({
  'submit form': function(evt) {
    evt.preventDefault();
    FlowComponents.callAction('onSubmit');
  }
});


/* ----------------------- Form submission detail ----------------------- */ 


var formSubmissionDetailComponent = FlowComponents.define('formSubmissionDetail', function () {
  this.formId = FlowRouter.getParam('formId');
});

// extend from submission detail mixin
formSubmissionDetailComponent.extend(SubmissionDetailMixin);



/* ----------------------- Form submission list ----------------------- */ 


var formSubmissionList = Components.define('formSubmissionList', function () {
  this.formId = FlowRouter.getParam('formId');

  
  this.onReady(function () {
    var headers = [];
    _.each(this.get('formFields'), function (field) {
      headers.push(field.text);
    });

    // set headers
    this.set('headers', headers);
  });
});

// form obj
formSubmissionList.state.form = function () {
  return FormBuilder.Collections.Forms.findOne({_id: this.formId});
};

formSubmissionList.state.formFields = function () {
  var fields = FormBuilder.Collections.Fields.find({formId: this.formId}).fetch();

  // filter only list fields
  fields = _.filter(fields, function (field) {
    return field.isOnList;
  });

  // sort by order and return
  return FormBuilder.LibHelpers.formFieldsByOrder(fields);
};


// filtered list
formSubmissionList.state.filteredList = function () {
  FlowRouter.watchPathChange();

  // querystring param filters
  var params = FlowRouter.current().queryParams;
  params.formId = this.formId;

  var filterQueries = FormBuilder.LibHelpers.submissionListQuery(params);

  return FormBuilder.Collections.Submissions.find(filterQueries);
};


// called every cell is displyed
formSubmissionList.state.displayValue = function (field) {
  var value = field.value;

  if (_.isDate(value)) {
    return moment(value).format('YYYY-MM-DD');
  }

  if (field.type === 'subForm') {
    return '';
  }

  return value;
};

// main list
formSubmissionList.state.objects = function () {
  var result = [];
  var submissions = this.get('filteredList');
  var formFields = this.get('formFields');

  submissions.forEach(function (submission) {
    var rows = [];

    // collecting entry values by correct field order (formFields)
    _.each(formFields, function (field) {
      var submissionValue = submission[field.name];
      field.value = submissionValue;
      rows.push(field);
    });

    result.push({_id: submission._id, formId: submission.formId, rows: rows});
  });

  return result;
};
