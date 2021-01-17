$(document).ready(function(){
    jQuery.support.cors = true;
    userI=localStorage.getItem("userID");  
    userN=localStorage.getItem("userN");
    document.getElementById("username").innerHTML = "Olá, "+userN;
	$('#inserir_btn').click(function (){
        var desi = $('#desi').val();
		var tempmin = $('#tempmin').val();
		var tempmax = $('#tempmax').val();
		var hummin = $('#hummin').val();
		var hummax = $('#hummax').val();
		var humme = $('#humme').val();
        var hummemax = $('#hummemax').val();
        
        if(desi == '' || tempmin == '' || tempmax == '' || hummin == '' || hummax == '' || humme == '' || hummemax == '' ){
                alert("Preencha todos os dados!");		
        }
        else{
            $.ajax({
                url:  localStorage.getItem('base_url')+"profiles",
                type: 'POST',
                dataType : 'json',
                contentType: "application/json; charset=utf-8",
                crossDomain:true,
                data:JSON.stringify({"designacao":desi,"temp_min":tempmin,"temp_max":tempmax,"hum_air_min":hummin,"hum_air_max":hummax,"hum_earth_min":humme,"hum_earth_max":hummemax}),
                success:function(data){
                    alert("Perfil adiconado!\nA redirecionar...")
                    window.location.href = "geral-perfil.html";
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