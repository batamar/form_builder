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

ComponentFieldGenerate.state.object = function () {
  return FormBuilder.Collections.Forms.findOne({_id: this.get('formId')});
};

ComponentFieldGenerate.state.getSubmitSchema = function () {
  // generate schema
  return FormBuilder.Helpers.generateSchema(this.get('formId'));
};

ComponentFieldGenerate.state.fields = function () {
  return FormBuilder.Collections.Fields.find({formId: this.get('formId')});
};

ComponentFieldGenerate.state.formId = function () {
  return FlowRouter.getParam('formId');
};


// subscribe to subForm fields
ComponentFieldGenerate.state.isFieldsReady = function () {
  var subFormIds = [];
  FormBuilder.Collections.Fields.find({formId: this.get('formId')}).forEach(function (field) {
    if (field.subForm) {
      subFormIds.push(field.subForm);
    }
  });

  var handler = Meteor.subscribe('fieldList', subFormIds);

  return handler.ready();
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

// extend from common field generate
formCUComponet.extend(ComponentFieldGenerate);

formCUComponet.state.isPreview = function () {
  return 'preview';
};




/* ----------------------- Form SUBMIT ----------------------- */ 

var formSubmitComponet = FlowComponents.define('formSubmit', function () {});

formSubmitComponet.extend(ComponentFieldGenerate);



AutoForm.hooks({
  submitForm: {
    onSubmit: function(insertDoc) {
      console.log(insertDoc);
      return false;
    }
  }
});
