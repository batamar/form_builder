/* ----------------------- Field ----------------------- */


// field form

var fieldFormComponent = FlowComponents.define('fieldForm', function (props) {
  this.set('form', props.form);
});

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
  'click .new': function () {
    FlowComponents.callAction('setField', null);
  },

  'click .delete': function () {
    FlowComponents.callAction('deleteField');
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
