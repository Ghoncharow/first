const mysql = require("mysql2");
const express = require("express");
const multer  = require("multer");
const fs = require("fs");
const port = process.env.PORT || 5000;
var key = true;
var user = '';
 
const connection = mysql.createConnection({
    host: "remotemysql.com",
    user: "rFnAPuHZXv",
    password: "fFibUtbJiV"
  });
   
  // Создание базы данных
  connection.query("CREATE DATABASE IF NOT EXISTS rFnAPuHZXv",
    function(err, results) {
      if(err) console.log(err);
      else console.log("База данных rFnAPuHZXv открыта.");    
  });
  
  connection.query("USE rFnAPuHZXv");
  
  // Создание таблицы
const sql1 = `create table if not exists users(
      id int primary key auto_increment,
      name varchar(255) not null,
      age int not null)`;
     
connection.query(sql1, function(err, results) {
    if(err) console.log(err);
    else console.log("Таблица users создана.");
});

connection.query("DELETE FROM users WHERE name='Admin' OR id=1");

const sql2 = "INSERT INTO users(id, name, age) VALUES(1, 'Admin', 100)";
 
connection.query(sql2, function(err, results) {
    if(err) console.log(err);
    else console.log("Таблица users инициализирована.");
});
  
const pool = mysql.createPool({
    connectionLimit: 50,
    host: "remotemysql.com",
    user: "rFnAPuHZXv",
    database: "rFnAPuHZXv",
    password: "fFibUtbJiV"
});

const app = express();
const storageConfig = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "uploads");
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname);
    }
});
app.use(multer({storage:storageConfig}).single("filedata"));
// создаем парсер для данных в формате json
const jsonParser = express.json();


app.get("/api/users", function(req, res){
    pool.query("SELECT * FROM users", function(err, data) {
        if(err) return console.log(err);
        res.send(data);
    });    
});

// получаем отправленные данные и добавляем их в БД 
app.post("/api/users", jsonParser, function (req, res) {         
    if(!req.body) return res.sendStatus(400);
    const name = req.body.name;
    const age = req.body.age;
    pool.query("INSERT INTO users (name, age) VALUES (?,?)", [name, age], function(err, data) {
      if(err) return console.log(err);
      res.json(data);
    });
});

// получем id редактируемого пользователя, получаем его из бд и отправлям
app.get("/api/users/:id", function(req, res){
    const id = req.params.id;
    pool.query("SELECT * FROM users WHERE id=?", [id], function(err, data) {
      if(err) return console.log(err);
       res.send(data);
    });
});

// получаем отредактированные данные и отправляем их в БД
app.post("/api/users/:id", jsonParser, function (req, res) {
         
    if(!req.body) return res.sendStatus(400);
    const id = req.params.id;
    const name = req.body.name;
    const age = req.body.age;
     
    pool.query("INSERT INTO users (id, name, age) VALUES (?,?,?)", [id, name, age], function(err, data) {
      if(err) return console.log(err);
      res.json(data);
    });
});

// получаем отредактированные данные и отправляем их в БД
app.put("/api/users", jsonParser, function (req, res) {
         
    if(!req.body) return res.sendStatus(400);
    const name = req.body.name;
    const age = req.body.age;
    const id = req.body.id;
     
    pool.query("UPDATE users SET name=?, age=? WHERE id=?", [name, age, id], function(err, data) {
      if(err) return console.log(err);
      res.json(data);
    });
});

// получаем id удаляемого пользователя и удаляем его из бд
app.delete("/api/users/:id", function(req, res){
          
    const id = req.params.id;
    pool.query("DELETE FROM users WHERE id=?", [id], function(err, data) {
      if(err) return console.log(err);
      res.send(data);
    });
});

var file = '';
app.post("/upload", jsonParser, function (req, res) {   
    file = req.file;
    console.log(file);
});
app.get("/upload", function(req, res){
    setTimeout(()=>res.send(file), 200);
});
app.get("/uploads/:id", function(req, res){
    const id = req.params.id;
    res.writeHead(200, {"Content-Type" : "application/msword"});
    fs.createReadStream("uploads/"+id).pipe(res);
});

// заходим в админку
app.post("/login", jsonParser, function (req, res) {         
    if(!req.body) return res.sendStatus(400);
    const name = req.body.name;
    const age = req.body.age;
    pool.query("SELECT * FROM users WHERE name=? AND age=?", [name, age], function(err, data) {
      if(err) return console.log(err);
      key = !data[0];
      user = name;
    });
    res.redirect("/");
});

// выходим из админки
app.post("/logout", jsonParser, function (req, res) {         
    if(!req.body) return res.sendStatus(400);
    key = true;
    res.redirect("/");
});

app.get("/user", function(req, res){
    setTimeout(()=>res.send(user), 200);
});

// временная переадресация
app.use("/index",function (request, response) {
    response.redirect("https://yandex.ru/")
});
// постоянная переадресация
app.use("/:id",function (request, response) {
    const id = request.params.id;
    if (id!='') response.redirect("/");
});

// загрузка фронтенда в браузер
app.get("/", function(request, response){
    setTimeout(()=>{
    if (key) response.sendFile(__dirname + "/index1.html");  
    else response.sendFile(__dirname + "/index.html");
    }, 60);
});
  
app.listen(port, ()=>{console.log(`Сервер запущен по адресу http://localhost:${port}.`);});