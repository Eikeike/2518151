
//Script to send login form. I used JQuery because it made a lot of things easier. I just didn't want to type in that much code
    $('#loginForm')
        .ajaxForm({
            url : '/login', 
            dataType : 'json',
            success : function (response) {
                if(response.message =="redirect"){
                    //in case of a successful login, the server sets the message to "redirect". This has to be done because a serverside redirect doesn't send a message, which 
                    //causes the form not to be updated (since we never enter the success function), forcing us to do a manual page reload. We do not want this.
                    console.log(response.location);
                    window.location.replace("http://localhost:3000/" + response.location)
                }
                else{
                    alert(response.message)
                }
            }, 
            resetForm: true
        });
