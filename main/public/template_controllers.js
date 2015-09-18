/* ----------------------- subFormField ----------------------- */


// if subForm needed
if (Template.subFormField) {
  var subFormFields;

  Template.subFormField.created = function () {
    if (this.data.type === 'subForm') {
      subFormFields = FormBuilder.filterFields(this.data.subForm);
    }
  };

  // helpers
  Template.subFormField.helpers({
    getSubFormFields: function (field) {
      return subFormFields;
    }
  });


  // events
  Template.subFormField.events({
    // add
    'click [data-action="add"]': function (evt, tmpl) {
      FormBuilder.addSubFieldItem(evt, tmpl);
    },

    // remove
    'click [data-action="remove"]': function (evt) {
      FormBuilder.removeSubFieldItem(evt);
    }
  });
}



/* ----------------------- Form ----------------------- */


Template.form.helpers({
  fields: function () {
    return FormBuilder.fieldList.get();
  },

  fieldsDic: function () {
    return FormBuilder.fieldsDic();
  },

  subsReady: function () {
    return FormBuilder.subsReady.get();
  }
});


Template.form.events({
  'click [data-action="save"]': function (evt, tmpl) {
    var dataToSave = FormBuilder.generateDataToSave(tmpl);

    FormBuilder.saveData(dataToSave);
  }
});
