$(document).ready(function(){
	jQuery.support.cors = true;
	$('#register_btn').click(function (){
			var user = $('#username').val();
			var pass = $('#pass').val();
			if(user == '' || pass == ''){
				alert("Preencha todos os dados.")
			}
			else{
					$.ajax({
							url: "http://192.168.137.1:3000/"+"users"+"/"+"signup",
							type: 'POST',
							dataType : 'json',
							contentType: "application/json; charset=utf-8",
							crossDomain: true,
			      			data: JSON.stringify({"username":user,"password":pass}),
							//tem que enviar tb o nome local, etc
							success:function(data){
								console.log(data);
								alert("Registado com sucesso.");
								window.location.href = "login.html";
							},
							error: function (xhr, ajaxOptions, thrownError) {
								console.log(JSON.stringify(xhr));
								console.log(JSON.stringify(thrownError));
								alert("Não foi possível registar.");
							}
					});
			}
	});
});
