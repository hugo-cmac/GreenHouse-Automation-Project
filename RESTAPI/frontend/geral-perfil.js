var edit;
var aux=[];
var cont =0;

var url = "ws://mqtt.dioty.co:8080/mqtt";
var options = {
    clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    username: "augustocesarsilvamota@gmail.com",
    password: "323c0782",
};
 
var client = mqtt.connect(url, options);

client.on('connect', function() { // When connected
	console.log("connected");
    /*
        client.subscribe('augustocesarsilvamota@gmail.com/ativar', function() {
            // when a message arrives, do something with it
            client.on('message', function(topic, message, packet) {
                console.log("Received '" + message + "' on '" + topic + "'");
            });
        });*/

        // publish a message to a topic
        
});


$(document).ready(function(){
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
            /*localStorage.setItem('userID',data.data.username);*/
            //localStorage.setItem('userIdgrande',data.userIdgrande);
            //alert("Perfil adiconado!\nA redirecionar...")
            for(i=0;i<data.data.length;i++){
                //console.log(aux[i]);
                aux[i]=data.data[i];
                cont = data.data.length;
                $('#listaPerfil').append(
                    "<div class=\"card\">"+
                        "<div class=\"card-header\">" +
                            "<h5 class=\"mb-0\">" +
                                "<button class=\"btn btn-link\" type=\"button\" data-toggle=\"collapse\" data-target=\"#collapseOne\" aria-expanded=\"true\" aria-controls=\"collapseOne\">" +
                                    "Perfil nº: " + data.data[i].id_perfil +
                            "</h5>"+
                        "</div>"+
                        "<div id=\"collapseOne\" class=\"collapse show\" aria-labelledby=\"headingOne\" data-parent=\"#accordionExample\">"+
                            "<div class=\"card-body\">"+
                                    "Designação: "+data.data[i].designacao+"<br/>"+
                                    "Temperatura minima: "+data.data[i].temp_min+"<br/>"+
                                    "Temperatura máxima: "+data.data[i].temp_max+"<br/>"+
                                    "Humidade do ar mínima: "+data.data[i].hum_air_min+"</br/>"+
                                    "Humidade do ar máxima: "+data.data[i].hum_air_max+"<br/>"+
                                    "Humidade do solo mínima: "+data.data[i].hum_earth_min+"<br/>"+
                                    "Humidade do solo máxima: "+data.data[i].hum_earth_max+"<br/>"+ 
                                    "<a class=\"banner_btn\" id=\"active_btn_"+i+"\""+" "+ "value=\"Ativar\">Ativar<i class=\"ti-arrow-right\"></i></a>"+               
                            "</div>"+
                        "</div>"+
                    "</div>"
                );

                for(var a=0;a<cont;a++){
                    
                    $("#active_btn_"+i).click(function() {

                        client.publish('/augustocesarsilvamota@gmail.com/ativar', aux[a], function() {
                            console.log("Message is published");
                            client.end(); // Close the connection when published
                        });

                       
                    });
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(JSON.stringify(xhr));
            console.log(JSON.stringify(thrownError));
            alert("Inseriu valores não válidos !");
        }
    });
});
