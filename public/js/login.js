$('#login-form').submit((evnt) => {
  console.log($('#email').val(), $('#password').val());
   evnt.preventDefault();
  $.post('/login', {
    email: $('#email').val(),
    pass: $('#password').val(),
  },(data) => {
    console.log("=====>", data);
    $('#message').html(data);
  });
});