var edit;

$(document).ready(function(){
	jQuery.support.cors = true;
    var desi;
    var tempmin;
    var tempmax;
    var hummin;
    var hummax;
    var humme;
    var hummemax;
    $.ajax({
        url:  localStorage.getItem('base_url')+"profiles",
        type: 'GET',
        dataType : 'json',
        contentType: "application/json; charset=utf-8",
        crossDomain:true,
        data:{},
        success:function(data){
            /*console.log(data.data.username);
            localStorage.setItem('userID',data.data.username);*/
            //localStorage.setItem('userIdgrande',data.userIdgrande);
            //alert("Perfil adiconado!\nA redirecionar...")
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(JSON.stringify(xhr));
            console.log(JSON.stringify(thrownError));
            alert("Inseriu valores não válidos !");
        }
    });
});