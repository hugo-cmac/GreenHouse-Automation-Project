$(document).ready(function(){
    
    $.ajax({
		url: localStorage.getItem('base_url') + "files",
		type: 'GET',
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		data: {},
		success: function (data) {
			edit=localStorage.getItem("userId");  
			document.getElementById('user').innerHTML = edit;
			
		},
		error: function (xhr, ajaxOptions, thrownError) {
			// alert(xhr.status);
			// alert(thrownError); 
		}
	});   
});