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

FormBuilder.init('frontTest', 'localhost:3000');

Template.form.rendered = function () {
  $('[data-role="loader"]').hide();

  FormBuilder.fileUpload('.fileupload', {
    fail: function (e, data) {
      console.log(data._response.jqXHR.responseText);
    },

    done: function (e, data) {
      var result = JSON.parse(data.result);

      console.log(result.files[0].url);
    }
  });

  $('.fileupload')
    .bind('fileuploadstart', function (e) {
      console.log('start');
    })
    .bind('fileuploadstop', function (e) {
      console.log('stop');
    });
};

Template.foriengLanguage.events(FormBuilder.subFormEvents);
