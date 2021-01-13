var edit;

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
            /*localStorage.setItem('userID',data.data.username);*/
            //localStorage.setItem('userIdgrande',data.userIdgrande);
            //alert("Perfil adiconado!\nA redirecionar...")
            for(i=0;i<data.data.length;i++){
                $('#listaPerfil').append(
                    "<div class=\"card\">"+
                        "<div class=\"card-header\">" +
                            "<h5 class=\"mb-0\">" +
                                "<button class=\"btn btn-link\" type=\"button\" data-toggle=\"collapse\" data-target=\"#collapseOne\" aria-expanded=\"true\" aria-controls=\"collapseOne\">" +
                                    "Dispositivo nº: " + data.data[i].id_device +
                            "</h5>"+
                        "</div>"+
                        "<div id=\"collapseOne\" class=\"collapse show\" aria-labelledby=\"headingOne\" data-parent=\"#accordionExample\">"+
                            "<div class=\"card-body\">"+
                                
                                    "Serial Number (SN): "+data.data[i].serial_number+"<br/>"+
                                   
                            "</div>"+
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
});