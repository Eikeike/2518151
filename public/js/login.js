
//Script to send login form. I used JQuery because it made a lot of things easier. I just didn't want to type in that much code
    $('#loginForm')
        .ajaxForm({
            url : '/login', 
            dataType : 'json',
            success : function (response) {
                if(response.message =="redirect"){
                    console.log(response.location);
                    window.location.replace("http://localhost:3000/" + response.location)
                }
                else{
                    alert(response.message)
                }
            }, 
            resetForm: true
        });