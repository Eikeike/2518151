
    $('#loginForm')
        .ajaxForm({
            url : '/login', // or whatever
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