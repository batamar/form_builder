// connect to our application
var formBuilder = new Asteroid('localhost:3000');

var subsReady = new Blaze.Var(false);
var applicationFormId = new Blaze.Var();
var formSubs = formBuilder.subscribe('formList'); // subscribe to forms
var formsCollection = formBuilder.getCollection('form_builder_forms'); // get forms collection
var formsQuery = formsCollection.reactiveQuery({code: 'test'}); // find form with the code application

var fieldsCollection = formBuilder.getCollection('form_builder_fields'); // get fields collection
var fieldList = new Blaze.Var([]);

formSubs.ready.then(function () {
  var applicationForm = formsQuery.result[0]; // get application form

  applicationFormId.set(applicationForm._id);

  var fieldSubs = formBuilder.subscribe('fieldList', [applicationForm._id]); // subscribe to given form's fields

  fieldSubs.ready.then(function () {

    var fields = fieldsCollection.reactiveQuery({}).result;

    // subform typed fields
    var subFormFields = _.filter(fields, function (field) {
      return field.type === 'subForm';
    });

    // select only subForm fields
    var subFormIds = _.pluck(subFormFields, 'subForm');

    // subscribe to subform fields
    var subFormSubs = formBuilder.subscribe('fieldList', subFormIds);

    subFormSubs.ready.then(function () {
      // tell subscriptions are ready
      subsReady.set(true);

      fieldList.set(_.sortBy(fields, 'order'));
    });
  });
});



/* ----------------------- common ui helpers ----------------------- */


UI.registerHelper('compare', function (value1, value2) {
  return value1 === value2;
});



/* ----------------------- subFormField ----------------------- */


var subFormFields;

Template.subFormField.created = function () {
  if (this.data.type === 'subForm') {
    subFormFields = fieldsCollection.reactiveQuery({formId: this.data.subForm}).result;
  }
};

// helpers
Template.subFormField.helpers({
  getSubFormFields: function (field) {
    return subFormFields;
  }
});


// re calculate all row fields data-schema-key attributes
var regenerateSubFieldKeys = function (subFieldTable) {
  $(subFieldTable).find('tr[data-role="per-row"]').each(function (trIndex, tr) {

    $(tr).find('[data-schema-key]').each(function () {
      var schemaKeyAttr = $(this).data('schema-key');
      var parts = schemaKeyAttr.split('.');

      var newSchemaKey = parts[0] + '.' + trIndex + '.' + parts[2];

      $(this).attr('data-schema-key', newSchemaKey);
    });

  });
};


// events
Template.subFormField.events({

  // add
  'click [data-action="add"]': function (evt, tmpl) {
    var newRow = $(tmpl.find('[data-info="initial-row"]')).clone();

    // remove initial-row flag
    newRow[0].removeAttribute('data-info');

    // find container table
    var containerTable = tmpl.find('table[data-role="main-container"] tbody');

    // add cloned row to table
    $(containerTable).append(newRow);

    // recalculate all data-schema-key attributes
    regenerateSubFieldKeys(containerTable);
  },

  // remove
  'click [data-action="remove"]': function (evt) {

    var tr = $(evt.currentTarget).closest('tr');

    if ($(tr).data('info') === 'initial-row') {
      return false;
    }

    var containerTable = $(evt.currentTarget).closest('table[data-role="main-container"] tbody');

    // remove actual row
    $(tr).remove();

    // recalculate all data-schema-key attributes
    regenerateSubFieldKeys(containerTable);
  }
});



/* ----------------------- Form ----------------------- */


Template.form.helpers({
  list: function () {
    return fieldList.get();
  },

  subsReady: function () {
    return subsReady.get();
  }
});


function getFieldValue(fieldName, widget, type) {
  var value;

  switch(type) {
    case 'input':
      value = $(widget).val();

      var attrType = $(widget).attr('type');

      switch(attrType) {
        case 'number':
          value = Number(value);
          break;

        case 'date':
          value = new Date(value);
          break;
      }

      break;

    case 'textarea':
      value = $(widget).val();
      break;

    case 'radio':
      value = $(widget).find('input:checked').attr('value');
      break;

    case 'check':
      value = [];
      $(widget).find('input:checked').each(function (index, elm) {
        value.push($(elm).attr('value'));
      });
      break;

    case 'select':
      value = $(widget).val();
      break;
  }

  return value;
}


Template.form.events({
  'click [data-action="save"]': function (evt, tmpl) {
    var dataToSave = {};

    tmpl.findAll('[data-schema-key]').each(function (index, widget) {
      var fieldName = $(widget).data('schema-key');

      // if this is subForm field then do nothing
      if (fieldName.indexOf('.') === -1) {
        var type = $(widget).data('schema-type');
        var value = getFieldValue(fieldName, widget, type);

        var subFieldName;
        var subFieldType;
        var subFieldValue;
        var subFieldEntry;

        if (type === 'subForm') {
          value = [];

          tmpl.findAll('table[data-role="main-container"] tr[data-role="per-row"]').each(function (index, tr) {

            subFieldEntry = {};

            $(tr).find('[data-schema-key]').each(function (index) {
              subFieldName = $(this).data('schema-key');
              subFieldType = $(this).data('schema-type');
              subFieldValue = getFieldValue(subFieldName, this, subFieldType);

              // convert contacts.0.name => name
              var parts = subFieldName.split('.');
              var newFieldName = parts[2];

              // increase subFieldEntry dic
              subFieldEntry[newFieldName] = subFieldValue;
            });

            // increase value list
            value.push(subFieldEntry);
          });
        }

        dataToSave[fieldName] = value;
      }
    });

    formBuilder.call('submissionSave', applicationFormId.get(), dataToSave).result.then(function (result) {
      // remove all old error messages
      $('[data-role="error"]').remove();

      if (result.msg === 'success') {
        alert('Success');
      }

      _.each(result.invalidFields, function (errorObj) {

        var errorTemplate = _.template($('#error-template').html());
        $('[data-schema-key="' + errorObj.name + '"]').after(errorTemplate(errorObj));

      });
    });
  }
});
