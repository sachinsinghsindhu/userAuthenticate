$('#register-form').submit((evnt) => {
  console.log($('#email').val(), $('#password').val());
   evnt.preventDefault();
  // axios.post('/register',{
  //   email: $('#email').val(),
  //   pass: $('#password').val(),
  // })
  // .then((data) => {
  //     console.log("=====>", data);
  //     $('#message').html(data);
  // })
  // .catch((err) => {
  //   console.log(err);
  // });
  $.post('/register', {
    email: $('#email').val(),
    pass: $('#password').val(),
  },(data) => {
    console.log("=====>", data);
    $('#message').html(data);
  });
});