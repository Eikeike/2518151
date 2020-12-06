
//This file is used for the registry process. It double checks the password and only lets the user register if he gets that right.
//Otherwise, it doesn't do much except for some ajax calls. I jused jQuery here because it was easier handling the request. This really is
//just out of pure laziness. 
    $('#loginForm')
    .ajaxForm({
        url : '/signup', 
        dataType : 'json',
        success : function (response) {
            if(response.location){  //when there is ann error, the server will send a redirect-location to the client. It states  where we should go on error. 
                alert(response.message)
                window.location.replace("http://localhost:3000/" + response.location) 
            }
            else{
                alert(response.message);
                window.location.replace("http://localhost:3000/home") //If there is no error, we can just say that signup has been successful and redirect home.
                
            }
        }, 
        beforeSubmit: function(arr, $form, options){ //This part is for double checking the password. 
            var passwords = arr.filter(key => {
                return key.name.includes('password')
            }).map(
                element => {
                    return element.value
                })
                console.log(JSON.stringify(passwords));
            //$('#password2').prop('disabled', true)
            var equal = (passwords[0] == passwords[1])
            console.log(equal);
            return equal;
        },
        resetForm: true
    });