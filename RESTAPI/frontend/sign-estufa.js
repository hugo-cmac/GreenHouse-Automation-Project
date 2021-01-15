var aux=[];

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
            for(var i=0;i<data.data.length;i++){
                aux[i]=data.data[i];
                $("#checkIn").append(
                    "<div class=\"switch-wrap d-flex justify-content-between\">"+
                        "<p>"+ "SN: " +data.data[i].serial_number+"</p>"+
                        "<div class=\"confirm-checkbox\" id=\"cc1\">"+
                            "<input type=\"checkbox\" id=\"confirm-checkbox"+i+"\""+"S"+">"+
                            "<label for=\"confirm-checkbox"+i+"\""+">"+"</label>"+
                        "</div>"+
                    "</div>"

                );
            }

        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(JSON.stringify(xhr));
            console.log(JSON.stringify(thrownError));
            alert("Inseriu valores não válidos !");
        }
    });
    


	$('#sign_btn').click(function (){
        var user = localStorage.getItem('userID');
        var desi = $('#desi').val();
        for()
        if(desi == ''){
                alert("Preencha todos os dados!");		
        }
        else{
            $.ajax({
                url:  localStorage.getItem('base_url')+"reluser",
                type: 'POST',
                dataType : 'json',
                contentType: "application/json; charset=utf-8",
                crossDomain:true,
                data:JSON.stringify({"id_user":user,"id_device":device,"designacao":desi}),
                success:function(data){
                    /*console.log(data.data.username);
                    localStorage.setItem('userID',data.data.username);*/
                    //localStorage.setItem('userIdgrande',data.userIdgrande);
                    alert("Estufa adicionada!\nA redirecionar...")
                    window.location.href = "admin.html";
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(JSON.stringify(xhr));
                    console.log(JSON.stringify(thrownError));
                    alert("Inseriu valores não válidos !");
                }
            });
        }
    });
});