var userI;
var userN;
var auxes=[];
var cont = 0;
var cont2=0;
var arr=[];
var strings=' ';

var url = "ws://mqtt.dioty.co:8080/mqtt";
var options = {
    clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    username: "augustocesarsilvamota@gmail.com",
    password: "323c0782",
};
 
var client = mqtt.connect(url, options);

client.on('connect', function() { // When connected
	console.log("connected");
});

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
			if(data.data.length == 0){
				$('#estufa').append(
					"<div class=\"col-md-6 col-lg-12\""+">"+
						"<div class=\"single-service\""+">"+
							"<div class=\"service-content\""+">"+
								"<h5>Oh não!</h5>"+
								"<p>Não tem estufas registadas, registe já !</p>"+
							"</div>"+
						"</div>"+
					"</div>"
				);
			}
			
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
								"<div class=\"col-md-9 mt-sm-20 left-align-p\" "+"id=\"esdata"+a+"\" "+ "value=\""+auxes[a].id_rel_user_device
								 +"\""+">"
				);
				 
				$.ajax({
					url: localStorage.getItem('base_url') + "history/"+auxes[a].serial_number,
					type: 'GET',
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					data: {},
					success: function (data) {
						var his = data.data.length;
						var del = $('#esdata'+cont2).attr('value');
						console.log(del);
						$('#esdata'+cont2).append(
										"<p>"+ "Dispositivo (SN): "+ data.data[his-1].serial_number+"</p>"+
										"<p>"+ "Temperatura: "+ data.data[his-1].temp + " ªC" +"</p>"+
										"<p>"+ "Humidade do ar: "+ data.data[his-1].hum_air + "%" +"</p>"+
										"<p>"+ "Humidade do solo: "+ data.data[his-1].hum_earth + "%" +"</p>"+
										"<p>"+ "Luminosidade: "+ data.data[his-1].luminosity+ "%" +"</p>"+
										"<p>"+ "Estado da estufa: "+ getState(data.data[his-1].states) +"</p>"+
										"<div class=\"container text-right\">"+	
											"<a class=\"banner_btn\" id=\"active_btn_"+cont2+"\""+" "+ "value=\""+ data.data[his-1].serial_number+"\"" +">Abrir<i class=\"ti-arrow-right\"></i></a>"+
											"<a class=\"banner_btn\" id=\"nactive_btn_"+cont2+"\""+" "+ "value=\""+ data.data[his-1].serial_number+"\"" +">Fechar<i class=\"ti-arrow-right\"></i></a>"+
											"<a class=\"banner_btn\" id=\"rega_btn_"+cont2+"\""+" "+ "value=\""+ data.data[his-1].serial_number+"\"" +">Regar<i class=\"ti-arrow-right\"></i></a>"+		
											"<a class=\"banner_btn\" id=\"eliminar_btn_"+cont2+"\""+" "+ "value=\""+ del+"\"" +">Eliminar<i class=\"ti-arrow-right\"></i></a>"+																		
										"</div"+
									"</div>"+
								"</div>"+
							"</div>"+
						"</div>"
						);	

						buttonWork(cont2);
					
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

function getState(aux){
	if(aux == 0){
		return "Fechada";
	}
	else{
		return "Aberta";
	}
	
}

function buttonWork(iter){
	
	$("#active_btn_"+iter).on('click',function() {
		var btnValue=($(this).attr('value'));
	//	console.log("SN BTN: "+btnValue);

		$.ajax({
			url: localStorage.getItem('base_url')+ "devices/"+btnValue,
			type: 'GET',
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			data: {},
			success: function (data) {
				var top = data.data[data.data.length-1].registcode;
				var data=data.data;
				console.log("SN: "+btnValue);
				console.log("registcode: "+top);
				var strBytes = getVal(top);
				console.log("Bytes concat: "+strBytes);
				var date = new Date().getTime();
				var totp = new jsOTP.totp();
				var timeCode = totp.getOtp(strBytes,date);
				var payload = timeCode+";0;1";
				console.log("Payload: "+payload);
				console.log('/augustocesarsilvamota@gmail.com/'+btnValue+"/in");
				client.publish('/augustocesarsilvamota@gmail.com/'+btnValue+"/in", payload, function() {
					console.log("Message is published");
					client.end(); // Close the connection when published
				});
			},
	
			error: function (xhr, ajaxOptions, thrownError) {
				console.log(xhr.status);
				console.log(thrownError);
			}
		});
	
		
	});

	$("#nactive_btn_"+iter).click(function() {
		var btnValue=($(this).attr('value'));
		//console.log("SN BTN: "+btnValue);
		$.ajax({
			url: localStorage.getItem('base_url')+ "devices/"+btnValue,
			type: 'GET',
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			data: {},
			success: function (data) {
				var top = data.data[data.data.length-1].registcode;
				var data=data.data;
				console.log("SN: "+btnValue);
				console.log("registcode: "+top);
				var strBytes = getVal(top);
				console.log("Bytes concat: "+strBytes);
				var date = new Date().getTime();
				var totp = new jsOTP.totp();
				var timeCode = totp.getOtp(strBytes,date);
				var payload = timeCode+";0;0";
				console.log("Payload: "+payload);
				console.log('/augustocesarsilvamota@gmail.com/'+btnValue+"/in");
				client.publish('/augustocesarsilvamota@gmail.com/'+btnValue+"/in", payload, function() {
					console.log("Message is published");
					client.end(); // Close the connection when published
				});
			},
	
			error: function (xhr, ajaxOptions, thrownError) {
				console.log(xhr.status);
				console.log(thrownError);
			}
		});
		
	});

	$("#eliminar_btn_"+iter).on('click',function() {
		var btnValue=($(this).attr('value'));
		$.ajax({
			url: localStorage.getItem('base_url')+"reluser/"+btnValue,
			type: 'DELETE',
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			data: {},
			success: function (data) {
				window.location.href = "admin.html";
			},
	
			error: function (xhr, ajaxOptions, thrownError) {
				console.log(xhr.status);
				console.log(thrownError);
				alert(xhr.responseText);

			}
		});
		
	});
}

function getVal(str){
	var aux = "";
	var bytes = [];

    for (var c = 0; c < str.length; c += 2){
        const code = parseInt(str.substr(c, 2), 16);
        bytes.push(code & 255, code >> 8); 
        //bytes.push(parseInt(str.substr(c, 2), 16));
    }

    console.log("RAW Bytes: "+bytes);

   	for (var a=0;a<bytes.length;a++){
		aux=aux.concat(bytes[a]);
	}
    return aux;
}

//[d7][28][30][b1][de][be][06][2e][bb][e7]