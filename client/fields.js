/* ----------------------- Field ----------------------- */


// field form

var fieldFormComponent = FlowComponents.define('fieldForm', function (props) {
  this.set('form', props.form);
});

fieldFormComponent.action.setField = function (field) {
  this.set('field', field);
};

fieldFormComponent.action.deleteField = function () {
  var self = this;
  var field = self.get('field');

  Meteor.call('deleteField', field._id, function () {
    // set current field to null
    self.set('field', null);
  });
};


AutoForm.hooks({
  fieldForm: {
    onSubmit: function(insertDoc) {
      var form = this.template.data.form;
      var fieldObj = this.template.data.doc;
      var fieldId = null;

      // update
      if (fieldObj) {
        
        fieldId = Meteor.call('updateField', form._id, fieldObj._id, insertDoc);

      // insert
      } else {
        fieldId = Meteor.call('createField', form._id, insertDoc);
      }

      // set new field
      FlowComponents.callAction('setField', FormBuilder.Collections.Fields.findOne({_id: fieldId}));

      return false;
    }
  }
});

Template.fieldForm.events({
  'click .new': function () {
    FlowComponents.callAction('setField', null);
  },

  'click .delete': function () {
    FlowComponents.callAction('deleteField');
  }
});



/* ----------------------- Field Preview ----------------------- */



// generate fields preview

var generateFieldsPreviewComponent = FlowComponents.define('generateFieldsPreview', function (props) {
  this.set('formId', props.formId);
});

generateFieldsPreviewComponent.state.fields = function () {
  return FormBuilder.Collections.Fields.find({formId: this.get('formId')});
};

generateFieldsPreviewComponent.state.isFieldsReady = function () {
  var handler = Meteor.subscribe('fieldList', [this.get('formId')]);
  return handler.ready();
};

// generate field preview

Template.generateFieldPreview.events({
  'click .field.preview': function (evt, tmpl) {
    var currentView = Blaze.currentView;

    var templateIns = AutoForm.templateInstanceForForm('fieldForm');

    // set currentView
    Blaze.currentView = templateIns.view;

    FlowComponents.callAction('setField', tmpl.data);

    // reset currentView
    Blaze.currentView = currentView;
  }
});


// generate field
Template.afArrayField_custom.helpers({
  getSubFields: function(field, context) {

    var fields = [];
    FormBuilder.Collections.Fields.find({formId: field.subForm}).forEach(function (subField) {
      subField.name = context.current[subField.name];
      subField.isSub = true;
      fields.push(subField);
    });

    return fields;
  }
});
