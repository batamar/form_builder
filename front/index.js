// hooks
FormBuilder.hooks.saveBegin = function (response) {
  $('[data-role="loader"]').show();
};

FormBuilder.hooks.saveEnd = function (response) {
  // remove all old error messages
  $('[data-role="error"]').remove();

  $('[data-role="loader"]').hide();
};

FormBuilder.hooks.saveSuccess = function (response) {
  alert('Success');
};

FormBuilder.hooks.saveError = function (response) {
  _.each(response.invalidFields, function (errorObj) {

    var errorTemplate = _.template($('#error-template').html());
    $('[data-schema-key="' + errorObj.name + '"]').after(errorTemplate(errorObj));
  });
};

FormBuilder.init('application');
