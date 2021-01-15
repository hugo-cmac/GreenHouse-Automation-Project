var edit;
var aux =0; 
var aux2=[];

$(document).ready(function(){
    jQuery.support.cors = true;
    

    $.ajax({
        url:  localStorage.getItem('base_url')+"devices",
        type: 'GET',
        dataType : 'json',
        contentType: "application/json; charset=utf-8",
        crossDomain:true,
        data:{},
        success:function(data){
            console.log(data.data.length);
            for(i=0;i<data.data.length;i++){
                aux2[i]=data.data[i];
                aux++;
                $('#listaDisp').append(
                    "<div class=\"col-sm-12 col-lg-6\">" +
                        "<div class=\"accordion\" id=\"listaPerfil\">"+
                            "<div class=\"card\">"+
                                "<div class=\"card-header\">" +
                                    "<h5 class=\"mb-0\">" +
                                        "<button class=\"btn btn-link\" type=\"button\" data-toggle=\"collapse\" data-target=\"#collapseOne\" aria-expanded=\"true\" aria-controls=\"collapseOne\">" +
                                            "Dispositivo nº: " + aux +
                                    "</h5>"+
                                "</div>"+
                                "<div id=\"collapseOne" + i + "\" " + "class=\"collapse show\" aria-labelledby=\"headingOne\" data-parent=\"#accordionExample\">"+
                                    "<div class=\"card-body\">"+
                                        
                                            "Serial Number (SN): "+data.data[i].serial_number+"<br/>"+
                                        
                                    "</div>"+
                                "</div>"+
                            "</div>"+
                        "</div>"+
                    "</div>"
                );
            }

            $.ajax({
                url:  localStorage.getItem('base_url')+"history",
                type: 'GET',
                dataType : 'json',
                contentType: "application/json; charset=utf-8",
                crossDomain:true,
                data:{},
                success:function(data){
                    console.log(data.data.length);
                    contb = data.data.length;
                    /*localStorage.setItem('userID',data.data.username);*/
                    //localStorage.setItem('userIdgrande',data.userIdgrande);
                    //alert("Perfil adiconado!\nA redirecionar...")
                    for(var i=0;i<aux;i++){
                        for(var a = 0;a<contb;a++)
                            if(aux2[i].serial_number == data.data[a].serial_number){
                            $('#collapseOne'+i).append(

                               ( "Amostra: "+data.data[a].id_history+ " "+ "<br/>").bold()+
                                "Timestamp: "+data.data[a].timest+"<br/>"+
                                "Temperatura: "+data.data[a].timest+"<br/>"+
                                "Humidade do ar: "+data.data[a].hum_air+"<br/>"+
                                "Humidade do solo: "+data.data[a].hum_earth+"<br/>"+
                                "Luminosidade: "+data.data[a].luminosity+"<br/>"+
                                "Estado do motor: "+data.data[a].states+"<br/>"

                            );
                        }
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(JSON.stringify(xhr));
                    console.log(JSON.stringify(thrownError));
                    alert("Inseriu valores não válidos !");
                }
            });

        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(JSON.stringify(xhr));
            console.log(JSON.stringify(thrownError));
            alert("Inseriu valores não válidos !");
        }
    });
});