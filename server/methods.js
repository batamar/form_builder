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
    
    // insert field
    modifier.formId = formId;
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



  /* ----------------------- submissions ----------------------- */

  submissionSave: function (formId, modifier, submissionId) {
    check(formId, String);
    check(submissionId, Match.OneOf(String, undefined));
    
    var schema = FormBuilder.Helpers.generateSchema(formId);
    check(modifier, schema);

    if (!submissionId) {
    
      modifier.createdDate = new Date();
      modifier.formId = formId;

      // insert field
      submissionId = FormBuilder.Collections.Submissions.insert(modifier);
    } else {

      // update
      FormBuilder.Collections.Submissions.update({_id: submissionId}, {$set: modifier});
    }

    return submissionId;
  },

  submissionDelete: function (submissionId) {
    check(submissionId, String);

    // delete submission
    FormBuilder.Collections.Submissions.remove({_id: submissionId});
  },

});
