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
  getSubFormFieldLabels: function (field) {
    return _.pluck(subFormFields, 'text');
  },

  getSubFormFields: function (field) {
    return subFormFields;
  }
});


// events
Template.subFormField.events({

  // add
  'click [data-action="add"]': function (evt, tmpl) {
    var initialRow = $(tmpl.find('[data-info="initial-row"]')).clone();

    // remove initial-row flag
    initialRow[0].removeAttribute('data-info');

    // find container table
    var containerTable = tmpl.find('table[data-role="main-container"] tbody');

    $(containerTable).append(initialRow);
  },

  // remove
  'click [data-action="remove"]': function (evt) {
    $(evt.currentTarget).closest('tr').remove();
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
      break;

    case 'textarea':
      value = $(widget).val();
      break;

    case 'radio':
      value = $('input[name="' + fieldName + '"]:checked').attr('value');
      break;

    case 'check':
      value = [];
      $(widget).find('input[name="' + fieldName + '"]:checked').each(function (index, elm) {
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

          $(tr).find('[data-schema-sub-key]').each(function (index) {
            subFieldName = $(this).data('schema-sub-key');
            subFieldType = $(this).data('schema-type');
            subFieldValue = getFieldValue(subFieldName, this, subFieldType);

            // increase subFieldEntry dic
            subFieldEntry[subFieldName] = subFieldValue;
          });

          // increase value list
          value.push(subFieldEntry);
        });
      }

      dataToSave[fieldName] = value;
    });

    formBuilder.call('submissionSave', applicationFormId.get(), dataToSave).result.then(function (result) {
      console.log(result);
    });
  }
});
