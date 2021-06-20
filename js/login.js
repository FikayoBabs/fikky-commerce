const  socket = io();


//login
var loginUsers = ()=>{
    
    let emailAddress = document.getElementById("uEmail").value;
    let password = document.getElementById("uPassword").value;
    var mapp = {};
    mapp["email"] = emailAddress
    mapp["password"] = password
    socket.emit('login', {mapp});
    // window.location.href = 'home.html';
  }

  socket.on('connect', () => {
    // populate the forms with the values
    socket.on('loginResult', data => {
    if(data.result.length > 0){
        let emailAddress = document.getElementById("uEmail").value;
        let password = document.getElementById("uPassword").value;

        if(password === data.result.mPassword){
            window.location.href = 'home.html';
            alert("login success")
        }

    }else{
        alert("No Record Found");
    }
    });
  
  });
  