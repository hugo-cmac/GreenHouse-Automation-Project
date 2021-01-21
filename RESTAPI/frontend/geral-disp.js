var edit;
var aux =0; 
var aux2=[];
var hisaux=[];
var contaux=0;
$(document).ready(function(){
    jQuery.support.cors = true;
    userI=localStorage.getItem("userID");  
    userN=localStorage.getItem("userN");
    document.getElementById("username").innerHTML = "Olá, "+userN;
    

    $.ajax({
        url:  localStorage.getItem('base_url')+"devices",
        type: 'GET',
        dataType : 'json',
        contentType: "application/json; charset=utf-8",
        crossDomain:true,
        data:{},
        success:function(data){
           // console.log(data.data.length);
            for(i=0;i<data.data.length;i++){
                aux2[i]=data.data[i];
                aux++;
                $('#listaDisp').append(
                    "<div class=\"col-sm-12 col-lg-6\">" +
                        "<div class=\"accordion\" id=\"listaPerfil"+i+ "\"" +">"+
                            "<div class=\"card\">"+
                                "<div class=\"card-header\""+" id=\"headingOne"+i+ "\"" +">" +
                                    "<h5 class=\"mb-0\">" +
                                        "<button class=\"btn btn-link\" type=\"button\" data-toggle=\"collapse\" data-target=\"#collapseOne"+ i +"\""+" aria-expanded=\"true\" aria-controls=\"collapseOne\">" +
                                            "Dispositivo nº: " + aux +
                                    "</h5>"+
                                "</div>"+
                                "<div id=\"collapseOne" + i + "\"" + " class=\"collapse\" aria-labelledby=\"headingOne"+i+ "\"" +" data-parent=\"#listaPerfil"+i+ "\"" +">"+
                                    "<div class=\"card-body\">"+      
                                            "Serial Number (SN): "+data.data[i].serial_number+"<br/>"+                                       
                                    "</div>"+
                                "</div>"+
                            "</div>"+
                        "</div>"+
                    "</div>"
                );
            }
            //console.log(aux)

            $.ajax({
                url:  localStorage.getItem('base_url')+"history",
                type: 'GET',
                dataType : 'json',
                contentType: "application/json; charset=utf-8",
                crossDomain:true,
                data:{},
                success:function(data){
                   // console.log(data.data.length);
                    contb = data.data.length;
                    hisaux = data.data;

                    for(var i=0;i<aux;i++){
                        $('#collapseOne'+i).append(
                            "<div class=\"container text-center\">"+
                                "<div class=\"single-element-widget\""+">"+
                                    "<div class=\"default-select\" id=\"default-select"+i+ "\"" +">"+
                                    "<select id=\"amos"+i+"\" " +">"
                        );
                        var cont=0;
                        for(var a = 0;a<contb;a++){                          
                            if(aux2[i].serial_number == data.data[a].serial_number){
                                cont++;
                                $('#amos'+i).append(
                                        "<option value=\""+data.data[a].id_history+";"+i+"\"" +">"+ "Amostra "+cont+"</option>"+
                                        "</select>"+
                                        "</div>"+
                                    "</div>"+
                                "</div>"
                                );   
                            }
                        }
                    }
                    
                
                    console.log(hisaux);
                    //console.log(aux);
                    for(var i=0;i<aux;i++){
                        // console.log(hisaux[a].id_history);
                        $('#amos'+i).on('click',function(){
                            for(var a=0;a<contb;a++){
                                var value=$(this).val();
                                var res=value.split(";");
                                $('#te'+res[1]).remove();
                                // alert($(this).val());
                                if(hisaux[a].id_history == res[0]){
                                    $('#collapseOne'+res[1]).append(
                                        "<div class=\"card-body\" "+"id=\"te"+res[1]+"\""+">"+          
                                            "ID_Amostra: "+hisaux[a].id_history+"<br/>"+
                                            "Timestamp: "+hisaux[a].timest+"<br/>"+
                                            "Temperatura: "+hisaux[a].temp+"ºC"+"<br/>"+
                                            "Humidade do ar: "+hisaux[a].hum_air+"%"+"<br/>"+
                                            "Humidade do solo: "+hisaux[a].hum_earth+"%"+"<br/>"+
                                            "Luminosidade: "+hisaux[a].luminosity+"%"+"<br/>"+
                                            "Estado: "+hisaux[a].states+"<br/>"+
                                        "</div"
                                    );
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

/* "ID_Amostra: "+data.data[a].id_history+ " "+ "<br/>"+
"Timestamp: "+data.data[a].timest+"<br/>"+
"Temperatura: "+data.data[a].temp+"<br/>"+
"Humidade do ar: "+data.data[a].hum_air+"<br/>"+
"Humidade do solo: "+data.data[a].hum_earth+"<br/>"+
"Luminosidade: "+data.data[a].luminosity+"<br/>"+
"Estado do motor: "+data.data[a].states+"<br/>"*/
