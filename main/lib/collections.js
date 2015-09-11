/* global FormBuilder */


// fix required field empty string problem
SimpleSchema.addValidator(function () {
  if (!this.definition.optional && (this.value === null || this.value === '')) {
    return 'required';
  }
});


/* ----------------------- Models ----------------------- */


FormBuilder.Models.Form = function(doc) {
  _.extend(this, doc);
};

_.extend(FormBuilder.Models.Form.prototype, {
});


FormBuilder.Models.Field = function(doc) {
  _.extend(this, doc);
};

_.extend(FormBuilder.Models.Field.prototype, {
});


/* ----------------------- Schemas ----------------------- */


// forms
FormBuilder.Schemas.Form = new SimpleSchema({
  title: {
    type: String,
    label: 'Нэр',
    unique: true,
  },

  isSub: {
    label: 'Дэд форм эсэх',
    type: Boolean
  }
});


FormBuilder.Schemas.FormExtra = new SimpleSchema({
  createdUser: {
    type: String
  },

  createdDate: {
    type: Date
  }
});


// fields
FormBuilder.Schemas.Field = new SimpleSchema({
  type: {
    type: String,
    label: 'Төрөл',
    autoform: {
      type: 'select',
      firstOption: 'Сонгоно уу',
      options: function () {
        return [
          {label: 'Нэг мөр текст', value: 'input'},
          {label: 'Олон мөр текст', value: 'textarea'},
          {label: 'Жагсаалтаас нэгийг сонгох', value: 'radio'},
          {label: 'Жагсаалтаас олныг сонгох', value: 'check'},
          {label: 'Унждаг сонголт', value: 'select'},
          {label: 'Дэд форм', value: 'subForm'},
          {label: 'Тусгаарлагч', value: 'seperator'},
        ];
      }
    }
  },

  check: {
    type: String,
    label: 'Шалгалт',
    optional: true,
    autoform: {
      type: 'select',
      firstOption: 'Сонгоно уу',
      options: function () {
        return [
          {label: 'Тоо', value: 'number'},
          {label: 'Огноо', value: 'date'},
          {label: 'Цахим шуудан', value: 'email'},
        ];
      }
    }
  },

  text: {
    type: String,
    label: 'Текст',
  },

  name: {
    type: String,
    label: 'Нэр',
    optional: true,
    regEx: /^[a-z0-9A-Z]*$/,
    max: 50
  },

  description: {
    type: String,
    label: 'Тайлбар/Тусламж',
    optional: true
  },

  // choose sub form
  subForm: {
    type: String,
    optional: true,
    label: 'Дэд форм',
    autoform: {
      type: 'select',
      firstOption: 'Сонгоно уу',
      options: function () {
        var options = [];
        
        // find all forms that are sub
        FormBuilder.Collections.Forms.find({isSub: true}).forEach(function (form) {
          options.push({label: form.title, value: form._id});
        });

        return options;
      }
    }
  },

  // for radio, check, select, choices
  options: {
    type: [String],
    optional: true,
    label: 'Сонголтууд'
  },

  isRequired: {
    type: Boolean,
    label: 'Заавал бөглөх ёстой'
  },

  isOnList: {
    type: Boolean,
    label: 'Жагсаалтад харагдах эсэх'
  },
});


FormBuilder.Schemas.FieldExtra = new SimpleSchema({
  formId: {
    type: String,
  },

  order: {
    type: Number,
    optional: true,
  }
});



/* ----------------------- Collections ----------------------- */


FormBuilder.Collections.Forms = new Mongo.Collection('form_builder_forms', {
  transform: function(doc) {
    return new FormBuilder.Models.Form(doc);
  }
});

FormBuilder.Collections.Forms.attachSchema(FormBuilder.Schemas.Form);
FormBuilder.Collections.Forms.attachSchema(FormBuilder.Schemas.FormExtra);


FormBuilder.Collections.Fields = new Mongo.Collection('form_builder_fields', {
  transform: function(doc) {
    return new FormBuilder.Models.Field(doc);
  }
});

FormBuilder.Collections.Fields.attachSchema(FormBuilder.Schemas.Field);
FormBuilder.Collections.Fields.attachSchema(FormBuilder.Schemas.FieldExtra);



/* ----------------------- Generate Schema ----------------------- */

function generateFieldOption (schemaOptions, field, isSubField) {
  var perOption = {label: field.text, autoform: {}};

  if (!field.isRequired) {
    perOption.optional = true;
  }

  // options
  var options = [];
  _.each(field.options, function(option) {
    options.push({label: option, value: option});
  });

  // input
  if (field.type === 'input') {
    switch(field.check) {
      case 'number':
        perOption.type = Number;
        break;

      case 'date':
        perOption.type = 'date';
        break;
      
      default:
        perOption.type = String;
    }
  }

  // textarea
  if (field.type === 'textarea') {
    perOption.type = String;

    perOption.autoform.afFieldInput = {
      type: 'textarea'
    };
  }

  // radio
  if (field.type === 'radio') {
    perOption.type = String;

    perOption.autoform.type = 'select-radio';
    perOption.autoform.options = options;
  }

  // check
  if (field.type === 'check') {
    perOption.type = [String];

    perOption.autoform.type = 'select-checkbox';
    perOption.autoform.options = options;
  }

  // select
  if (field.type === 'select') {
    perOption.type = String;

    perOption.autoform.type = 'select';
    perOption.autoform.options = options;
  }

  // if this field is not subField then insert it to schema keys directly
  if (!isSubField && perOption.type) {
    schemaOptions[field.name] = perOption;
  }

  // subform
  if (field.type === 'subForm') {
    schemaOptions[field.name] = {label: field.text, type: Array};
    schemaOptions[field.name + '.$'] = {
      type: Object
    };

    FormBuilder.Collections.Fields.find({formId: field.subForm}).forEach(function (subField) {
      schemaOptions[field.name + '.$.' + subField.name] = generateFieldOption(schemaOptions, subField, true);
    });
  }

  return perOption;
}

FormBuilder.Helpers.generateSchema = function (formId) {
  var schemaOptions = {};

  FormBuilder.Collections.Fields.find({formId: formId}).forEach(function (field) {
    generateFieldOption(schemaOptions, field, false);
  });

  return new SimpleSchema(schemaOptions);
};


// Collection
FormBuilder.Collections.Submissions = new Mongo.Collection('form_builder_submissions');



/* ----------------------- Helpers ----------------------- */


// helper for submission list server and client filter
FormBuilder.LibHelpers.submissionListQuery = function (params) {
  return params;
};


// Returns entry values with labels
FormBuilder.LibHelpers.submissionValuesWithLabels = function (submission, formFields, filterFieldKeys) {
  // if not passed then get all keys
  if (!filterFieldKeys) {
    filterFieldKeys = _.without(_.keys(submission), '_id', 'formId');
  }

  var result = [];
  var fieldLabelsByKey = {};

  // formFields = [{name: 'description', text: 'Тайлбар'}, {name: 'name', text: 'Нэр'}] => {description: 'Тайлбар', name: 'Нэр'}
  _.each(formFields, function (field) {
    fieldLabelsByKey[field.name] = field.text;
  });

  // submission = {name: 'ХААН', description: 'Сайн байгууллага'} = > {name: {label: 'Нэр', value: 'ХААН'}, description: {label: 'Тайлбар', value: 'Сайн байгууллага'}}
  _.each(_.keys(submission), function (key) {
    
    // field key must be in filter
    if (_.contains(filterFieldKeys, key)) {
      result.push({label: fieldLabelsByKey[key], value: submission[key]});
    }
  });

  return result;
};

FormBuilder.LibHelpers.formFieldsByOrder = function (fields) {
  // get fields by order

  return fields.sort(function (prevField, nextField) {
    return prevField.order > nextField.order;
  });
};
