var edit;
var aux=[];
var cont = 0;
var contb = 0;

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
    document.getElementById("username").innerHTML = "Olá, "+userN;
    jQuery.support.cors = true;
    
    $.ajax({
        url:  localStorage.getItem('base_url')+"profiles",
        type: 'GET',
        dataType : 'json',
        contentType: "application/json; charset=utf-8",
        crossDomain:true,
        data:{},
        success:function(data){
            cont = data.data.length;
            for(i=0;i<data.data.length;i++){
                //console.log(aux[i]);
                aux[i]=data.data[i];
                cont = data.data.length;
                $('#listaPerfil2').append(
                    "<div class=\"col-sm-12 col-lg-6\">" +
                        "<div class=\"accordion\" id=\"listaPerfil"+ i + "\"" +">"+
                            "<div class=\"card\">"+
                                "<div class=\"card-header\" "+"id=\"headingOne"+i+ "\"" +">" +
                                    "<h5 class=\"mb-0\">" +
                                        "<button class=\"btn btn-link\" type=\"button\" data-toggle=\"collapse\" data-target=\"#collapseOne"+ i+ "\"" + "aria-expanded=\"true\" aria-controls=\"collapseOne"+ i+ "\"" +">" +
                                            "Perfil nº: " + data.data[i].id_perfil +
                                    "</h5>"+
                                "</div>"+
                                "<div id=\"collapseOne"+i+ "\"" + " class=\"collapse\" aria-labelledby=\"headingOne"+i+ "\"" +" data-parent=\"#listaPerfil"+ i +"\""+">"+
                                    "<div class=\"card-body\">"+
                                            "Designação: "+data.data[i].designacao+"<br/>"+
                                            "Temperatura minima: "+data.data[i].temp_min+"<br/>"+
                                            "Temperatura máxima: "+data.data[i].temp_max+"<br/>"+
                                            "Humidade do ar mínima: "+data.data[i].hum_air_min+"</br/>"+
                                            "Humidade do ar máxima: "+data.data[i].hum_air_max+"<br/>"+
                                            "Humidade do solo mínima: "+data.data[i].hum_earth_min+"<br/>"+
                                            "Humidade do solo máxima: "+data.data[i].hum_earth_max+"<br/>"+ 
                                            "<div class=\"single-service\">"+
                                                "<div class=\"service-content\">"+
                                                    "<div class=\"container text-center\">"+
                                                    "<p>"+ "<a class=\"banner_btn\" id=\"active_btn_"+i+"\""+" "+ "value=\""+i+"\"" +">Ativar<i class=\"ti-arrow-right\"></i></a>"+"</p>"+
                                                    "</div>"+             
                                                "</div>"+
                                            "</div>"+
                                    "</div>"+
                                "</div>"+
                            "</div>"+
                        "</div>"+
                    "</div>"
                );
            }

            $.ajax({
                url:  localStorage.getItem('base_url')+"devices/"+userI,
                type: 'GET',
                dataType : 'json',
                contentType: "application/json; charset=utf-8",
                crossDomain:true,
                data:{},
                success:function(data){
                    contb = data.data.length;

                    for(i=0;i<data.data.length;i++){
                        $('#swiPerfil').append(
                            "<div class=\"switch-wrap d-flex justify-content-between\">"+
                                "<p>"+data.data[i].designacao +"</p>"+
                                "<div class=\"primary-switch\">"+
                                "<input type=\"checkbox\""+ "  value=\""+ data.data[i].serial_number+";"+data.data[i].registcode +"\""+ " " + "id=\"default-switch"+i+"\""+" "+"checked" +">"+
                                "<label for=\"default-switch"+i+"\""+">"+"</label>"+
                                "</div>"+
                            "</div>"
                        );
                    }

                    for(var a=0;a<cont;a++){
                        $("#active_btn_"+a).on('click',function() {
                            var btnValue=($(this).attr('value'));
                            console.log("B value: "+btnValue);
                            for(var b=0;b<contb;b++){
                                if(document.getElementById("default-switch"+b).checked == true){
                                    console.log(aux[btnValue]);
                                    var val = document.getElementById("default-switch"+b).value;
                                    var seriREG = val.split(';');
                                    console.log("SN: "+seriREG[0]);
                                    console.log("registcode: "+seriREG[1]);
                                    var top = seriREG[1];
                                    var strBytes = getVal(top);
                                   // console.log("Bytes concat: "+strBytes);
                                    console.log("top: "+top);
                                    var date = new Date().getTime();
                                    var dateaux = Math.floor(date / 1000);
                                    console.log("milliseconds: "+date);
                                    console.log("seconds: "+dateaux);
                                    var totp = new jsOTP.totp();
                                    var timeCode = totp.getOtp(strBytes,date);
                                    console.log('/augustocesarsilvamota@gmail.com/'+seriREG[0]+'/in');
                                    var payload = timeCode+";"+"2"+";"+aux[btnValue].temp_max+";"+aux[btnValue].temp_min+";"+aux[btnValue].hum_air_max+";"+aux[btnValue].hum_air_min+";"+aux[btnValue].hum_earth_max+";"+aux[btnValue].hum_earth_min;
                                    console.log("Payload: "+payload);
                                    client.publish('/augustocesarsilvamota@gmail.com/'+seriREG[0]+'/in', payload, function() {
                                        console.log("Message is published");
                                        client.end(); // Close the connection when published
                                    });
                                }
                            }
                        });
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(JSON.stringify(xhr));
                    console.log(JSON.stringify(thrownError));
                    alert("Erro de ligação!");
                }
            });

        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(JSON.stringify(xhr));
            console.log(JSON.stringify(thrownError));
            alert("Erro de ligação!");
        }
    });
});

function getVal(str){
	var aux = "";
    var bytes = [];

    for (var c = 0; c < str.length; c += 2){
        const code = parseInt(str.substr(c, 2), 16); 
        bytes.push(code & 255, code >> 8); 
        //bytes.push(parseInt(str.substr(c, 2), 16));
    }

//    console.log("RAW Bytes: "+bytes);

   	for (var a=0;a<bytes.length;a++){
		aux=aux.concat(bytes[a]);
	}
    return aux;
}

    //[d7][28][30][b1][de][be][06][2e][bb][e7]

