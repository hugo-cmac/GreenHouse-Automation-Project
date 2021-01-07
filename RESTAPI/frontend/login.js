$(document).ready(function(){
	jQuery.support.cors = true;
	$('#login_btn').click(function (){
        var user = $('#username').val();
        var pssw = $('#pass').val();
        var token = '';
        if(user == '' || pssw == ''){
                alert("Preencha todos os dados");		
        }
        else{
            $.ajax({
                url:  localStorage.getItem('base_url')+"login",
                type: 'POST',
                dataType : 'json',
                contentType: "application/json; charset=utf-8",
                crossDomain:true,
                data:JSON.stringify({"username":user,"pass":pssw}),
                success:function(data){
                    console.log(data.data.username);
                    localStorage.setItem('userID',data.data.username);
                    //localStorage.setItem('userIdgrande',data.userIdgrande);
                    alert("Login efetuado.\nA redirecionar...")
                    window.location.href = "admin.html";
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(JSON.stringify(xhr));
                    console.log(JSON.stringify(thrownError));
                    alert("Enganou-se no username e/ou password, tente novamente");
                }
            });
        }
    });
    $('#registar_btn').click(function (){
        window.location.href = "registo.html";
    });
    


});