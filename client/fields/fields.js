/* ----------------------- Field ----------------------- */


// field form

var fieldFormComponent = FlowComponents.define('fieldForm', function (props) {
  this.set('form', props.form);

  var self = this;
  this.onRendered(function () {
    self.hideConditionalFields();
  });

});

// hide conditional fiels
fieldFormComponent.prototype.hideConditionalFields = function (field) {
  // hide name field
  $('input[name="name"]').closest('.form-group').hide();

  // hide description field
  $('input[name="description"]').closest('.form-group').hide();

  // hide sub form options
  $('select[name="subForm"]').closest('.form-group').hide();

  // hide sub form options
  $('input[name="options.0"]').closest('.panel').hide();
};

fieldFormComponent.action.hideConditionalFields = function (field) {
  this.hideConditionalFields();
};

// set field
fieldFormComponent.action.setField = function (field) {
  this.set('field', field);
};

// delete field
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
  'change select[name="type"]': function (evt, tmpl) {
    var value = tmpl.find('select').value;

    FlowComponents.callAction('hideConditionalFields');

    // other than separtor then show name and description fields
    if (value !== 'seperator') {
      $('input[name="name"]').closest('.form-group').show();
      $('input[name="description"]').closest('.form-group').show();
    }

    // if type is subForm then show subForms choices
    if (value === 'subForm') {
      $('select[name="subForm"]').closest('.form-group').show();
    }

    // if type is radio, check or select then show options array
    if (_.contains(['radio', 'check', 'select'], value)) {
      $('input[name="options.0"]').closest('.panel').show();
    }
  },

  'click .new': function () {
    FlowComponents.callAction('setField', null);
  },

  'click .delete': function () {
    FlowComponents.callAction('deleteField');
  }
});



/* ----------------------- Generate Field ----------------------- */


Template.afArrayField_custom.onRendered(function () {
  // display first row's labels
  $('.autoform-array-item:first label').css({'display': 'block'});
});

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


/* ----------------------- Field Preview ----------------------- */


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
