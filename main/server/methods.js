/* global FormBuilder */



/**
 * Form methods
 */


Meteor.methods({
  /* ----------------------- forms ----------------------- */

  formInsert: function (modifier) {
    check(modifier, FormBuilder.Schemas.Form);

    modifier.createdUser = 1; //this.userId;
    modifier.createdDate = new Date();

    // create
    FormBuilder.Collections.Forms.insert(modifier);
    return modifier;
  },

  formUpdate: function (modifier, docId) {
    check(modifier, {$set: Object, $unset: Match.Optional(Object)});
    check(modifier.$set, FormBuilder.Schemas.Form);
    check(docId, String);

    // update
    FormBuilder.Collections.Forms.update(docId, modifier);
  },

  formDelete: function (docId) {
    check(docId, String);
    
    // remove
    FormBuilder.Collections.Forms.remove(docId);
  },



  /* ----------------------- fields ----------------------- */


  createField: function (formId, modifier) {
    check(formId, String);
    check(modifier, FormBuilder.Schemas.Field);
    
    // set form
    modifier.formId = formId;

    // find last field by order
    var lastField = FormBuilder.Collections.Fields.findOne({}, {fields: {order: 1}, sort: {order: -1}});

    if (lastField) {
      modifier.order = lastField.order++;
    } else {
      // if there is no field then start with 0
      modifier.order =  0;
    }

    // insert field
    return FormBuilder.Collections.Fields.insert(modifier);
  },

  updateField: function (formId, fieldId, modifier) {
    check(formId, String);
    check(fieldId, String);

    check(modifier, FormBuilder.Schemas.Field);
    
    // update field
    FormBuilder.Collections.Fields.update(fieldId, {$set: modifier});

    return fieldId;
  },

  deleteField: function (docId) {
    check(docId, String);
    
    // remove
    FormBuilder.Collections.Fields.remove(docId);
  },

  updateFieldOrder: function (formId, orders) {
    check(formId, String);
    check(orders, Object);

    // update each field's order
    _.each(_.keys(orders), function (fieldId) {
      var order = orders[fieldId];
      FormBuilder.Collections.Fields.update({_id: fieldId}, {$set: {order: order}});
    });
  },


  /* ----------------------- submissions ----------------------- */

  submissionSave: function (formId, modifier, submissionId) {
    check(formId, String);
    check(submissionId, Match.OneOf(String, undefined));
    check(modifier, Object);
    
    var schema = FormBuilder.Helpers.generateSchema(formId);

    var context = schema.newContext();
    var isValid = context.validate(modifier);

    // if data is invalid then return validation messages
    if (!isValid ) {

      var invalidFields = context.invalidKeys();

      _.each(invalidFields, function (invalidField) {
        
        // add human readable message property
        invalidField.message = context.keyErrorMessage(invalidField.name);
      });
      
      // return invalid field definitions with corresponding messages
      return {msg: 'error', invalidFields: invalidFields};
    }

    if (!submissionId) {
    
      modifier.createdDate = new Date();
      modifier.formId = formId;

      // insert field
      submissionId = FormBuilder.Collections.Submissions.insert(modifier);
    } else {

      // update
      FormBuilder.Collections.Submissions.update({_id: submissionId}, {$set: modifier});
    }

    return {msg: 'success', submissionId: submissionId};
  },

  submissionDelete: function (submissionId) {
    check(submissionId, String);

    // delete submission
    FormBuilder.Collections.Submissions.remove({_id: submissionId});
  },

});
