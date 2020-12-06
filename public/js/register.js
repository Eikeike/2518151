
//This file is used for the registry process. It double checks the password and only lets the user register if he gets that right.
//Otherwise, it doesn't do much except for some ajax calls. I jused jQuery here because it was easier handling the request. This really is
//just out of pure laziness. 
    $('#loginForm')
    .ajaxForm({
        url : '/signup', 
        dataType : 'json',
        //This is what happens on success
        //Before submitting, double check passwords
        beforeSubmit: function(arr, $form, options){
            //There has to be a simpler solution. I didn't find it. So here are all the inputs containing a password
            var passwords = arr.filter(key => {
                return key.name.includes('password')
            }).map(
                element => {
                    return element.value
                })
                console.log(JSON.stringify(passwords)); //Debug, but it's nice to see
            //$('#password2').prop('disabled', true)
            var equal = (passwords[0] == passwords[1])
            if(!equal){
                alert("Your passwords do not match");
                $('#loginForm').trigger('reset');
            }
            console.log(equal);
            return equal;
        },
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
        
        resetForm: true
    });