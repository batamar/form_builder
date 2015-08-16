/* ----------------------- Form LIST ----------------------- */


var formListComponet = FlowComponents.define('formList', function () {});

formListComponet.state.objects = function () {
  return FormBuilder.Collections.Forms.find();
};



/* ----------------------- Form CREATE && UPDATE ----------------------- */ 

var formCUComponet = FlowComponents.define('formCU', function () {
  var formId = this.get('formId');

  this.autorun(function() {
    if (formId) {
      this.set('af', {type: 'method-update', method: 'formUpdate'});

    } else {
      this.set('af', {type: 'method', method: 'formInsert'});
    }
  });
});

formCUComponet.state.object = function () {
  return FormBuilder.Collections.Forms.findOne({_id: this.get('formId')});
};

formCUComponet.state.formId = function () {
  return FlowRouter.getParam('id');
};



/* ----------------------- Form SUBMIT ----------------------- */ 

var formSubmitComponet = FlowComponents.define('formSubmit', function () {});

formSubmitComponet.state.object = function () {
  return FormBuilder.Collections.Forms.findOne({_id: this.get('formId')});
};

// generate schema
formSubmitComponet.state.getSubmitSchema = function () {
  return FormBuilder.Helpers.generateSchema(this.get('formId'));
};

formSubmitComponet.state.fields = function () {
  return FormBuilder.Collections.Fields.find({formId: this.get('formId')});
};

formSubmitComponet.state.formId = function () {
  return FlowRouter.getParam('formId');
};


// subscribe to subForm fields
formSubmitComponet.state.isFieldsReady = function () {
  var subFormIds = [];
  FormBuilder.Collections.Fields.find({formId: this.get('formId')}).forEach(function (field) {
    if (field.subForm) {
      subFormIds.push(field.subForm);
    }
  });

  var handler = Meteor.subscribe('fieldList', subFormIds);

  return handler.ready();
};


AutoForm.hooks({
  submitForm: {
    onSubmit: function(insertDoc) {
      console.log(insertDoc);
      return false;
    }
  }
});
