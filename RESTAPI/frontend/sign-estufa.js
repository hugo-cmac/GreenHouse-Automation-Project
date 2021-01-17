var aux=[];
var contdev=0;

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
            for(var i=0;i<data.data.length;i++){
                aux[i]=data.data[i];
                contdev=data.data.length;
                $("#checkIn").append(
                    "<div class=\"switch-wrap d-flex justify-content-between\">"+
                        "SN: " +data.data[i].serial_number+
                        "<div class=\"confirm-checkbox\" id=\"cc1\">"+
                            "<input type=\"checkbox\" id=\"confirm-checkbox"+i+"\""+ " value=\""+data.data[i].serial_number+ "\" " +">"+
                            "<label for=\"confirm-checkbox"+i+"\""+">"+"</label>"+
                        "</div>"+
                    "</div>"

                );
            }

        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(JSON.stringify(xhr));
            console.log(JSON.stringify(thrownError));
            alert("Erro de ligação!");
        }
    });
    


	$('#sign_btn').click(function (){
        var dev;
        var user = localStorage.getItem('userID');
        var desi = $('#desi').val();
        for(var a=0;a<contdev;a++){
            if(document.getElementById("confirm-checkbox"+a).checked == true){
                console.log(document.getElementById("confirm-checkbox"+a).value);
                dev = document.getElementById("confirm-checkbox"+a).value;
            }
        }
        if(desi == '' || dev == ''){
                alert("Preencha e selecione todos os dados!");		
        }
        else{
            $.ajax({
                url:  localStorage.getItem('base_url')+"reluser",
                type: 'POST',
                dataType : 'json',
                contentType: "application/json; charset=utf-8",
                crossDomain:true,
                data:JSON.stringify({"id_user":user,"serial_number":dev,"designacao":desi}),
                success:function(data){
                
                    alert("Estufa adicionada!\nA redirecionar...")
                    window.location.href = "admin.html";
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(JSON.stringify(xhr));
                    console.log(JSON.stringify(thrownError));
                    alert("Erro de ligação!!");
                }
            });
        }
    });
});