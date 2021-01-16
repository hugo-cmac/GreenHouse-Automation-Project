var userI;
var userN;
var auxes=[];

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
					auxes[i]=data.data[i];
				}
			}

			for(var a=0;a<auxes.length;a++){
				console.log(aux[a]);
				localStorage.setItem('des',auxes[a].designacao);
				$.ajax({
					url: localStorage.getItem('base_url') + "history/"+auxes[a].serial_number,
					type: 'GET',
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					data: {},
					success: function (data) {
						var his = data.data.length;
						$('#estufa').append(
							"<div class=\"container\">"+
								"<div class=\"section-top-border\">"+
									"<h3 class=\"mb-30 title_color\">"+ localStorage.getItem('des') +"</h3>"+
										"<div class=\"row\">"+
											"<div class=\"col-md-3\">"+
												"<img src=\"img/estufa2.jpeg\" alt=\"\" class=\"img-fluid\">"+
											"</div>"+
										"<div class=\"col-md-9 mt-sm-20 left-align-p\">"+
											"<p>"+ "Dispositivo (SN): "+ data.data[his-1].serial_number+"</p>"+
											"<p>"+ "Temperatura: "+ data.data[his-1].temp + " ªC" +"</p>"+
											"<p>"+ "Humidade do ar: "+ data.data[his-1].hum_air + "%" +"</p>"+
											"<p>"+ "Humidade do solo: "+ data.data[his-1].hum_earth + "%" +"</p>"+
											"<p>"+ "Luminosidade: "+ data.data[his-1].luminosity+ " (Lumens)" +"</p>"+
											"<p>"+ "Estado do motor: "+ getState(data.data[his-1].states) +"</p>"+
										"</div>"+
									"</div>"+
								"</div>"+
							"</div>"
						);	
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

function getState(aux){
	if(aux == 0){
		return "Desligado";
	}
	else{
		return "Ligado";
	}
	
}

/*function getDevicesES(auxe){
	console.log[auxe];

	for(var a=0;a<auxe.length;a++){
		console.log[auxe[a]];
		$.ajax({
			url: localStorage.getItem('base_url') + "history/"+auxe[a].serial_number,
			type: 'GET',
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			data: {},
			success: function (data) {
				var his = data.data.length;
				$('#estufa').append(
					"<div class=\"container\">"+
						"<div class=\"section-top-border\">"+
							"<h3 class=\"mb-30 title_color\">"+"Estufa "+ auxe[a].designacao +"</h3>"+
								"<div class=\"row\">"+
									"<div class=\"col-md-3\">"+
										"<img src=\"img/estufa2.jpeg\" alt=\"\" class=\"img-fluid\">"+
									"</div>"+
								"<div class=\"col-md-9 mt-sm-20 left-align-p\">"+
									"<p>"+ +"</p>"+
								"</div>"+
							"</div>"+
						"</div>"+
					"</div>"
				);	
			},
			error: function (xhr, ajaxOptions, thrownError) {
				// alert(xhr.status);
				// alert(thrownError); 
			}
		});
		
	}

}*/