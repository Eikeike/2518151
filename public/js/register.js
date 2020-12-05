
    $('#loginForm')
    .ajaxForm({
        url : '/signup', // or whatever
        dataType : 'json',
        success : function (response) {
            if(response.location){
                alert(response.message)
                window.location.replace("http://localhost:3000/" + response.location)
            }
            else{
                alert(response.message);
                window.location.replace("http://localhost:3000/home")
                
            }
        }, 
        beforeSubmit: function(arr, $form, options){
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