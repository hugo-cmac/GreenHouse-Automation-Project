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
                url:  localStorage.getItem('base_url')+"devices",
                type: 'GET',
                dataType : 'json',
                contentType: "application/json; charset=utf-8",
                crossDomain:true,
                data:{},
                success:function(data){
                   // console.log(data.data.length);
                    contb = data.data.length;

                    for(i=0;i<data.data.length;i++){
                        $('#swiPerfil').append(
                            "<div class=\"switch-wrap d-flex justify-content-between\">"+
                                "<p>"+ "Dispositivo " +(i+1)+ " (SN)" +":  " + data.data[i].serial_number +"</p>"+
                                "<div class=\"primary-switch\">"+
                                "<input type=\"checkbox\""+ "  value=\""+ data.data[i].serial_number +"\""+ " " + "id=\"default-switch"+i+"\""+" "+"checked" +">"+
                                "<label for=\"default-switch"+i+"\""+">"+"</label>"+
                                "</div>"+
                            "</div>"
                        );
                    }

                    for(var a=0;a<cont;a++){
                        $("#active_btn_"+a).click(function() {
                            var btnValue=($(this).attr('value'));
                            for(var b=0;b<contb;b++){
                                if(document.getElementById("default-switch"+b).checked == true){
                                    console.log(b);
                                    var val = document.getElementById("default-switch"+b).value;
                                    console.log('/augustocesarsilvamota@gmail.com/'+val);
                                    var payload = "000000;2;"+aux[btnValue].temp_max+";"+aux[btnValue].temp_min+";"+aux[btnValue].hum_air_max+";"+aux[btnValue].hum_air_min+";"+aux[btnValue].hum_earth_max+";"+aux[btnValue].hum_earth_min;
                                    client.publish('/augustocesarsilvamota@gmail.com/'+val+"/in", payload, function() {
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


