var edit;
var aux=[];
var cont =0;
var hostname = "mqtt.dioty.co";
var port = 1883;
var clientId = "CERCI_ESP_ID";
clientId += new Date().getUTCMilliseconds();;
var username = "augustocesarsilvamota@gmail.com";
var password = "323c0782";
mqttClient = new Paho.MQTT.Client(hostname, port, clientId);
var subscription = "augustocesarsilvamota@gmail.com/+/ativar";
/*mqttClient.onMessageArrived = MessageArrived;
mqttClient.onConnectionLost = ConnectionLost;*/
Connect();


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
            console.log(data.data.length);
            /*localStorage.setItem('userID',data.data.username);*/
            //localStorage.setItem('userIdgrande',data.userIdgrande);
            //alert("Perfil adiconado!\nA redirecionar...")
            for(i=0;i<data.data.length;i++){
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
                        
                        //Connect();
                        Connected();
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

    /*$('#collapseOne').click(function() {

        $('#collapseOne').removeClass('collapse');
        $('#collapseOne').addClass('collapse show');

    });*/


});

function Connect(){
	mqttClient.connect({
	onSuccess: Connected,
	onFailure: ConnectionFailed,
	keepAliveInterval: 5000,
	userName: username,
	useSSL: true,
    password: password});
    
    console.log("ligou crllll");
}

function Connected() {
	console.log("Connected");
	mqttClient.subscribe(subscription);
}

function ConnectionFailed(res) {
	console.log("Connect failed:" + res.errorMessage);
}

function ConnectionLost(res) {
	if (res.errorCode !== 0) {
		console.log("Connection lost:" + res.errorMessage);
		Connect();
	}
}