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
		url: localStorage.getItem('base_url') + "reluser/"+userI,
		type: 'GET',
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		data: {},
		success: function (data) {
			console.log(data.data.length);
			if(data.data.length == 0){
				$('#estufa').append(
					"<div class=\"col-md-6 col-lg-12\""+">"+
						"<div class=\"single-service\""+">"+
							"<div class=\"service-content\""+">"+
								"<h5>Oh não!</h5>"+
								"<p>Não tem estufas registadas, registe já!</p>"+
							"</div>"+
						"</div>"+
					"</div>"
				);
			}
			
			// for(var i=0;i<data.data.length;i++){
			// 	if(data.data[i].id_user==userI){
			// 		auxes[cont]=data.data[i];
			// 		cont++;
			// 	}
		
			

			for(var a=0;a<data.data.length;a++){
				console.log("a: "+a);
				//localStorage.setItem('des',auxes[a].designacao);
				//strings=localStorage.getItem('des');
				$('#estufa').append(
					"<div class=\"container\">"+
						"<div class=\"section-top-border\">"+
							"<h3 class=\"mb-30 title_color\" "+"id=\"de"+a+"\""+">"+data.data[a].designacao+"</h3>"+
								"<div class=\"row\">"+
									"<div class=\"col-md-3\">"+
										"<img src=\"img/estufa2.jpeg\" alt=\"\" class=\"img-fluid\">"+
									"</div>"+
								"<div class=\"col-md-9 mt-sm-20 left-align-p\" "+"id=\"esdata"+data.data[a].serial_number+"\" "+ "value=\""+data.data[a].id_rel_user_device
								 +"\""+">"
				);
				 
				var del = $('#esdata'+data.data[a].serial_number).attr('value');
				$('#esdata'+data.data[a].serial_number).append(
								"<div class=\"container text-right\">"+	
									"<a class=\"banner_btn\" id=\"active_btn_"+data.data[a].serial_number+"\""+" "+ "value=\""+ data.data[a].serial_number+"\"" +" registcode=\""+ data.data[a].registcode +"\">Abrir<i class=\"ti-arrow-right\"></i></a>"+
									"<a class=\"banner_btn\" id=\"nactive_btn_"+data.data[a].serial_number+"\""+" "+ "value=\""+ data.data[a].serial_number+"\""+" registcode=\""+ data.data[a].registcode +"\">Fechar<i class=\"ti-arrow-right\"></i></a>"+
									"<a class=\"banner_btn\" id=\"rega_btn_"+data.data[a].serial_number+"\""+" "+ "value=\""+ data.data[a].serial_number+"\""+" registcode=\""+ data.data[a].registcode  +"\">Regar<i class=\"ti-arrow-right\"></i></a>"+		
									"<a class=\"banner_btn\" id=\"eliminar_btn_"+data.data[a].serial_number+"\""+" "+ "value=\""+ del+"\"" +">Eliminar<i class=\"ti-arrow-right\"></i></a>"+																		
								"</div"+
							"</div>"+
						"</div>"+
					"</div>"+
				"</div>"
				);
				buttonWork(data.data[a].serial_number);
				$.ajax({
					url: localStorage.getItem('base_url') + "history/"+data.data[a].serial_number,
					type: 'GET',
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					data: {},
					success: function (data2) {
						console.log(data2.data.length);
						if(data2.data.length > 0){
							$('#esdata'+data2.data[0].serial_number).append(
											"<p>"+ "Dispositivo (SN): "+ data2.data[0].serial_number+"</p>"+
											"<p>"+ "Temperatura: "+ data2.data[0].temp + " ªC" +"</p>"+
											"<p>"+ "Humidade do ar: "+ data2.data[0].hum_air + "%" +"</p>"+
											"<p>"+ "Humidade do solo: "+ data2.data[0].hum_earth + "%" +"</p>"+
											"<p>"+ "Luminosidade: "+ data2.data[0].luminosity+ "%" +"</p>"+
											"<p>"+ "Estado da estufa: "+ getState(data2.data[0].states) +"</p>"
							);
						}else{
							$('#esdata'+data2.data.serial_number).append(
								"<p>"+ "Dispositivo (SN): "+ data2.data.serial_number+"</p>"+
								"<p>"+ "Não tem histórico!! </p>"
							);
						}
						
					},
					
					error: function (xhr, ajaxOptions, thrownError) {

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
		var regi = ($(this).attr('registcode'));
		var top = regi;
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
		
	});

	$("#nactive_btn_"+iter).click(function() {
		var btnValue=($(this).attr('value'));
	//	console.log("SN BTN: "+btnValue);
		var regi = ($(this).attr('registcode'));
		var top = regi;
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
		
	});

	$("#rega_btn_"+iter).on('click',function() {
		var btnValue=($(this).attr('value'));
	//	console.log("SN BTN: "+btnValue);
		var regi = ($(this).attr('registcode'));
		var top = regi;
		console.log("SN: "+btnValue);
		console.log("registcode: "+top);
		var strBytes = getVal(top);
		console.log("Bytes concat: "+strBytes);
		var date = new Date().getTime();
		var totp = new jsOTP.totp();
		var timeCode = totp.getOtp(strBytes,date);
		var payload = timeCode+";1;1";
		console.log("Payload: "+payload);
		console.log('/augustocesarsilvamota@gmail.com/'+btnValue+"/in");
		client.publish('/augustocesarsilvamota@gmail.com/'+btnValue+"/in", payload, function() {
			console.log("Message is published");
			client.end(); // Close the connection when published
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