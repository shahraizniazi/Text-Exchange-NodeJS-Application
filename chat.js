$(document).ready(function(){
	
	let messages = [];
	let socket = io.connect('http://localhost:3100');
	let chatForm = $('#chatForm');
	let message =$('#chatInput');
	let chatWindow = $('#chatWindow');
	let userFormWrap = $('#userFormWrap');
	let username =$('#username');
	let chatusers = $('#chatusers');
	let error = $('#error');
	
	// Submit User Form
	
	userFormWrap.on('submit', function(e){
		socket.emit('set user', username.val(), function(data){
			
			if(data){
				$('#userFormWrap').hide();
				$('#mainWrap').show();
				
			} else{
				error.html('Username is taken');
			}
		});
		e.preventDefault();
		
		
	});
	
	// Submit chat form
	chatForm.on('submit', function(e){
		socket.emit('send message', message.val());
		message.val('');
		e.preventDefault();
		
	});
	
	// show message
	socket.on('show message', function(data){
		
		chatWindow.append('<strong>'+ data.user + '</strong>: '+ data.msg+'<br>');
	});
	
	
	//Display names
	
	socket.on('chatusers', function(data){
		let html ='';
		for(let i =0; i< data.length;i++){
			console.log(chatusers);
			
			html += '<li class ="list-group-item">'+data[i]+'</li>';
			
		}
		chatusers.html(html);
		
		
	});
	
});
