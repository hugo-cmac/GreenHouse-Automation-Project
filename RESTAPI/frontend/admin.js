var userI;
var userN;
var auxes=[];
var cont = 0;
var cont2=0;
var arr=[];
var strings=' ';
$(document).ready(function(){
	userI=localStorage.getItem("userID");  
	userN=localStorage.getItem("userN");
	console.log(userI);
	console.log(userN);

	document.getElementById("username").innerHTML = "Olá, "+userN;

    $.ajax({
		url: localStorage.getItem('base_url') + "reluser",
		type: 'GET',
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		data: {},
		success: function (data) {
			for(var i=0;i<data.data.length;i++){
				if(data.data[i].id_user==userI){
					auxes[cont]=data.data[i];
					cont++;
				}
			}
			console.log(auxes.length);

			for(var a=0;a<auxes.length;a++){
				console.log("a: "+a);
				localStorage.setItem('des',auxes[a].designacao);
				strings=localStorage.getItem('des');
				$('#estufa').append(
					"<div class=\"container\">"+
						"<div class=\"section-top-border\">"+
							"<h3 class=\"mb-30 title_color\" "+"id=\"de"+a+"\""+">"+strings+"</h3>"+
								"<div class=\"row\">"+
									"<div class=\"col-md-3\">"+
										"<img src=\"img/estufa2.jpeg\" alt=\"\" class=\"img-fluid\">"+
									"</div>"+
								"<div class=\"col-md-9 mt-sm-20 left-align-p\" "+"id=\"esdata"+a+"\""+">"
				);
				 
				$.ajax({
					url: localStorage.getItem('base_url') + "history/"+auxes[a].serial_number,
					type: 'GET',
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					data: {},
					success: function (data) {
						var his = data.data.length;
						$('#esdata'+cont2).append(
										"<p>"+ "Dispositivo (SN): "+ data.data[his-1].serial_number+"</p>"+
										"<p>"+ "Temperatura: "+ data.data[his-1].temp + " ªC" +"</p>"+
										"<p>"+ "Humidade do ar: "+ data.data[his-1].hum_air + "%" +"</p>"+
										"<p>"+ "Humidade do solo: "+ data.data[his-1].hum_earth + "%" +"</p>"+
										"<p>"+ "Luminosidade: "+ data.data[his-1].luminosity+ "%" +"</p>"+
										"<p>"+ "Estado da estufa: "+ getState(data.data[his-1].states,cont2) +"</p>"+
										"<div class=\"container text-right\">"+	
											"<a class=\"banner_btn\" id=\"active_btn_"+cont2+"\""+" "+ "value=\""+cont2+"\"" +">Abrir<i class=\"ti-arrow-right\"></i></a>"+
											"<a class=\"banner_btn\" id=\"nactive_btn_"+cont2+"\""+" "+ "value=\""+cont2+"\"" +">Fechar<i class=\"ti-arrow-right\"></i></a>"+
											"<a class=\"banner_btn\" id=\"rega_btn_"+cont2+"\""+" "+ "value=\""+cont2+"\"" +">Regar<i class=\"ti-arrow-right\"></i></a>"+										
										"</div"+
									"</div>"+
								"</div>"+
							"</div>"+
						"</div>"
						);	
					
						cont2++;			
					},
					
					error: function (xhr, ajaxOptions, thrownError) {
						// alert(xhr.status);
						// alert(thrownError); 
					}
				});
			}
		},
		error: function (xhr, ajaxOptions, thrownError) {
			// alert(xhr.status);
			// alert(thrownError); 
		}
	}); 
});

function getState(aux,ole){
	if(aux == 0){
		$('#nactive_btn_'+ole).show().hide();
		return "Fechada";
	}
	else{
		$("#active_btn_"+ole).show().hide();
		return "Aberta";
	}
	
}
