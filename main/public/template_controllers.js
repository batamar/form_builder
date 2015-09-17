/* ----------------------- form ----------------------- */

Template.form.rendered = function () {
  $('[data-role="loader"]').hide();
};


/* ----------------------- subFormField ----------------------- */


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



/* ----------------------- Form ----------------------- */


Template.form.helpers({
  list: function () {
    return FormBuilder.fieldList.get();
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
