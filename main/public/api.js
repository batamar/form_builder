/* ----------------------- common ui helpers ----------------------- */


UI.registerHelper('compare', function (value1, value2) {
  return value1 === value2;
});


var FormBuilder = {
  hooks: {
    saveBegin: function () {},
    saveEnd: function () {},
    saveSuccess: function () {},
    saveError: function () {}
  }
};

// initialize reactive vars
FormBuilder.subsReady = new Blaze.Var(false);
FormBuilder.formId = new Blaze.Var();
FormBuilder.fieldList = new Blaze.Var([]);

FormBuilder.init = function (formCode, domain, ssl) {
  var self = this;
  this.domain = domain;

  if (!this.domain) {
    this.domain = 'form.nmtec.co';
  }

  // connect to our application
  FormBuilder.appInstance = new Asteroid(this.domain, ssl);

  var formSubs = this.appInstance.subscribe('publicForms'); // subscribe to forms
  var formsCollection = this.appInstance.getCollection('form_builder_forms'); // get forms collection
  var formsQuery = formsCollection.reactiveQuery({code: formCode}); // find form with the given code

  FormBuilder.fieldsCollection = this.appInstance.getCollection('form_builder_fields'); // get fields collection

  formSubs.ready.then(function () {
    var form = formsQuery.result[0]; // get form

    // set found formId
    self.formId.set(form._id);

    var fieldSubs = self.appInstance.subscribe('publicFormFields', [form._id]); // subscribe to given form's fields

    fieldSubs.ready.then(function () {

      var fields = FormBuilder.fieldsCollection.reactiveQuery({}).result;

      // subform typed fields
      var subFormFields = _.filter(fields, function (field) {
        return field.type === 'subForm';
      });

      // select only subForm fields
      var subFormIds = _.pluck(subFormFields, 'subForm');

      // subscribe to subform fields
      var subFormSubs = self.appInstance.subscribe('publicFormFields', subFormIds);

      subFormSubs.ready.then(function () {
        // tell subscriptions are ready
        self.subsReady.set(true);

        self.fieldList.set(_.sortBy(fields, 'order'));
      });
    });
  });
};

FormBuilder.fieldsDic = function () {
  var fields = this.fieldList.get();
  var fieldsByName = {};

  _.each(fields, function (field) {
    fieldsByName[field.name] = field;
  });

  return fieldsByName;
};


FormBuilder.filterFields = function (formId) {
  return this.fieldsCollection.reactiveQuery({formId: formId}).result;
};

// re calculate all row fields data-schema-key attributes
FormBuilder.regenerateSubFieldKeys = function (subFieldTable) {

  $(subFieldTable).find('tr[data-role="per-row"]').each(function (trIndex, tr) {

    $(tr).find('[data-schema-key]').each(function () {
      var schemaKeyAttr = $(this).data('schema-key');
      var parts = schemaKeyAttr.split('.');
      var newSchemaKey = parts[0] + '.' + trIndex + '.' + parts[2];

      $(this).attr('data-schema-key', newSchemaKey);
    });

  });
};

// add sub field item
FormBuilder.addSubFieldItem = function (evt, tmpl) {
  var newRow = $(tmpl.find('[data-info="initial-row"]')).clone();

  // remove initial-row flag
  newRow[0].removeAttribute('data-info');

  // find container table
  var containerTable = tmpl.find('table[data-role="main-container"] tbody');

  // add cloned row to table
  $(containerTable).append(newRow);

  // recalculate all data-schema-key attributes
  this.regenerateSubFieldKeys(containerTable);
};

// Remove sub field item
FormBuilder.removeSubFieldItem = function (evt) {
  var tr = $(evt.currentTarget).closest('tr');

  if ($(tr).data('info') === 'initial-row') {
    return false;
  }

  var containerTable = $(evt.currentTarget).closest('table[data-role="main-container"] tbody');

  // remove actual row
  $(tr).remove();

  // recalculate all data-schema-key attributes
  this.regenerateSubFieldKeys(containerTable);
};


/*
 * get cleared value from given widget
 */

FormBuilder.getFieldValue = function (fieldName, widget, type) {
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
};


FormBuilder.generateDataToSave = function (tmpl) {

  var self = this;
  var dataToSave = {};

  tmpl.findAll('[data-schema-key]').each(function (index, widget) {
    var fieldName = $(widget).data('schema-key');

    // if this is subForm field then do nothing
    if (fieldName.indexOf('.') === -1) {
      var type = $(widget).data('schema-type');
      var value = self.getFieldValue(fieldName, widget, type);

      var subFieldName;
      var subFieldType;
      var subFieldValue;
      var subFieldEntry;

      if (type === 'subForm') {
        value = [];

        $(widget).find('table[data-role="main-container"] tr[data-role="per-row"]').each(function (index, tr) {

          subFieldEntry = {};

          $(tr).find('[data-schema-key]').each(function (index) {
            subFieldName = $(this).data('schema-key');
            subFieldType = $(this).data('schema-type');
            subFieldValue = FormBuilder.getFieldValue(subFieldName, this, subFieldType);

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

  return dataToSave;
};

FormBuilder.saveData = function (dataToSave) {
  this.hooks.saveBegin(dataToSave);

  var self = this;
  var result = this.appInstance.call('submissionSave', this.formId.get(), dataToSave).result;

  result.then(function (response) {
    self.hooks.saveEnd(response);

    // success
    if (response.msg === 'success') {
      self.hooks.saveSuccess(response);

    // error
    } else {
      self.hooks.saveError(response);
    }
  });

  result.fail(function (response) {
    console.log(response);
  });
};


FormBuilder.fileUpload = function (handler, options) {
  options.url = 'http://' + this.domain + '/upload';
  options.formData = {
    domain: location.hostname || this.domain,
  };

  $(handler).fileupload(options);
};
