$(document).ready(function(){
	jQuery.support.cors = true;
	$('#register_btn').click(function (){
			var user = $('#username').val();
			var mail = $('#mail').val();
			var pass = $('#pass').val();
			if(user == '' || mail == '' || pass == ''){
				alert("Preencha todos os dados.")
			}
			else{
					$.ajax({
							url: "http://localhost:3000"+"/"+"register",
							type: 'POST',
							dataType : 'json',
							contentType: "application/json; charset=utf-8",
							crossDomain: true,
			      			data: JSON.stringify({"username":user,"mail":mail,"pass":pass}),
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
