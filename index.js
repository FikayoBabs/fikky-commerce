const express = require('express');
const mysql = require('mysql');
const app = express();
const path = require('path');
app.use(express.static(__dirname+"/public"))
// app.use(express.static(path.join(__dirname, 'public')));
app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

const bodyParser = require('body-parser'); 
app.use(bodyParser.json()); 

app.get('/',(req,res)=>{
    res.render('home')
});

//connect to DB
var mysqlConnection = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: 'Fikayomi@7',
      database : 'ecommerce'
    }
    );

var upDateDB = (data)=>{
    data.products.forEach(product => {
    //  var sqlCmd = `UPDATE Product SET Title = '${product.title}' , Price = '${product.price}', Image = '${product.image}';`;
     var sqlCmd = `INSERT INTO Product (Title,Price ,Image)\
        VALUES ( '${product.title}',' ${product.price}', '${product.image}');`;
    console.log(sqlCmd);
        mysqlConnection.query(sqlCmd,(err,rows,field)=>{
            if(!err) console.log("success");
            else console.log(err);
            
        });

    });
    
}

var RegisterUser = (data)=>{
   
    //  var sqlCmd = `UPDATE Product SET Title = '${product.title}' , Price = '${product.price}', Image = '${product.image}';`;
     var sqlCmd = `INSERT INTO User (firstName,lastName,mPassword,email,gender,phoneNo)\
        VALUES ( '${data.mapp["firstName"]}','${data.mapp["lastName"]}','${data.mapp["password"]}','${data.mapp["email"]}','${data.mapp["gender"]}','${data.mapp["phoneNo"]}');`;
     console.log(sqlCmd);
        mysqlConnection.query(sqlCmd,(err,rows,field)=>{
            if(!err) console.log("success");
            else console.log(err);      
        });
}

var LoginUsers = (data)=>{
   
   // var sqlCmd = `SELECT * FROM studentforms WHERE MatricNumber='${data.studentMatNum}';`;
     var sqlCmd = `SELECT * FROM User ;`;
    //VALUES ( '${data.mapp["password"]}',' ${data.mapp["email"]} ');`;
     console.log(sqlCmd);
        mysqlConnection.query(sqlCmd,(err,rows,field)=>{
            if(!err) {
                resultArray = JSON.parse(JSON.stringify(rows));
                console.log(resultArray);
                io.sockets.emit("loginResult",{result:rows});
            }
            else console.log(err);      
        });
}
server =app.listen(3000, () => {
    connectToDB();
    console.log(`listening on port 3000`);
  })

// socket listeners
const io = require("socket.io")(server);
io.on('connection', socket => {
// listen for emited events from the app.js

socket.on('product',(data)=>{
    console.log("Here");
   upDateDB(data);
    
});
socket.on('register',(data)=>{
    RegisterUser(data)
});
socket.on('login',(data)=>{
    console.log("Here" + data.mapp.toString());
    LoginUsers(data)
});
      // INSERTS DETAILS TO DB IF THIS EVENT GETS FIRED
     
        socket.on('studentDetails',(data)=>{
        var value = data.studentDetails.split(",");
        var sqlCmd = `INSERT INTO studentforms (MatricNumber,FirstName ,LastName, \
            Gender,Email,Levels)\
            VALUES ('${value[2]}',' ${value[0]}', '${value[1]}', '${value[4]}', \
            '${value[5]}', '${value[3]}');`;
            mysqlConnection.query(sqlCmd,(err,rows,field)=>{
                if(!err) console.log("success");
                else io.sockets.emit("insertResult",{matNum:value[2]});
                
            });
    });
    // UPDATES DETAILS TO DB IF THIS EVENT GETS FIRED
    socket.on('updateStudentDetails',(data)=>{

      var value = data.studentDetails.split(",");
      var sqlCmd = `UPDATE studentforms
       SET FirstName = '${value[0]}' , LastName = '${value[1]}', Gender = '${value[4]}' , Email = '${value[5]}' , Levels = '${value[3]}'
       WHERE MatricNumber = '${value[2]}';`;
      console.log(sqlCmd);
          mysqlConnection.query(sqlCmd,(err,rows,field)=>{
              if(!err) console.log("success");
              else console.log(err);
              
          });
  });
      // SEARCHES FOR STUDENT DETAILS WITH THE MAT NO PARAMETER
        socket.on("searchStudentDetails",(data)=>{
        var sqlCmd = `SELECT * FROM studentforms WHERE MatricNumber='${data.studentMatNum}';`;
        mysqlConnection.query(sqlCmd,(err,rows,field)=>{
            if(!err){
            resultArray = JSON.parse(JSON.stringify(rows));
            console.log(resultArray);
            io.sockets.emit("searchResult",{result:rows});
            }
            else console.log("failed" + sqlCmd);
        });
    });

    // DELETES  STUDENT DETAILS WITH THE MAT NO PARAMETER
          socket.on("deleteStudentDetails",(data)=>{
          var value = data.studentDetails.split(",");
          var sqlCmd = `DELETE FROM studentforms WHERE MatricNumber='${value[2]}';`;
          mysqlConnection.query(sqlCmd,(err,rows,field)=>{
              if(!err)console.log("Deleted Sucessfully" );
              else console.log("failed" );
          }); 
  });
  });

  var connectToDB = ()=>{
    mysqlConnection.connect((err)=>{
      if(!err) console.log("connection success");
      else console.log("connection failed :" + JSON.stringify(err,undefined,2));
    });
  }

//   class Products{
//     async getProducts(){
//         try {
//             let result = await  fetch('public/products.json')
//             let data = await result.json();
    
//             let products = data.items;
//             products = products.map(item =>{
//                 const {title,price} = item.fields;
//                 const {id} = item.sys;
//                 const image = item.fields.image.fields.file.url;
//                 return {title,price,id,image};
//             })
//             return products
//         } catch (error) {
//            console.log(error); 
//         }
      
//         }
//     }
