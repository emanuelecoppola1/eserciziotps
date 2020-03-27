const express=require ("express");
const app=express ();
const path=require ("path");
const sqlite3=require ("sqlite3");
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.set ("views",path.join(__dirname,"views"))
app.set ("view engine", "ejs");

const db=new sqlite3.Database("libri.db" , function(){
    app.listen(3000);   
       
});

app.get('/',function(req,res){
    let sql = "SELECT libri.id, libri.titolo, group_concat(autori.cognome) as autori FROM libri INNER JOIN autori_libri ON libri.id=autori_libri.id_libro INNER JOIN autori ON autori_libri.id_autore=autori.id GROUP BY libri.id ORDER BY libri.titolo"
    db.all(sql,(err,rows)=>{
        if (err) res.send('è esploso');
        else res.render('index',{rows});
    });
});

app.get("/admin", function(req, res) {
    res.sendFile(path.join(__dirname,"public", "admin.html"));
});

app.get ("/admin/autori", function(req,res){
    const sql="select * from autori;"
    db.all(sql,function(err,rows) {
        res.render("admin_autori", {autori:rows});
    });
});

app.get ("/admin/libri", function(req,res){
    const sql="select * from libri;"
    db.all(sql,function(err,rows) {
        res.render("admin_libri", {libri:rows});
    });
});

app.get ("/admin/relazioni", function(req,res){
    const sql="select * from autori_libri;"
    db.all(sql,function(err,rows) {
        res.render("admin_relazioni", {relazioni:rows});
    });
});

app.post("/modificautori", function(req, res) {
    const id = parseInt(req.body.id);
    sql="UPDATE Autori SET nome='"+req.body.nome+"',cognome='"+req.body.cognome+"' WHERE Autori.id ="+id;
    db.run(sql);
    res.redirect('/admin/autori');
});

app.post("/addautore", function(req, res) {
    const id = parseInt(req.body.id);
    sql="INSERT INTO Autori(nome,cognome) VALUES('"+ req.body.nome +"','"+req.body.cognome+"')";
    db.run(sql);
    res.redirect('/admin/autori');
});

app.post("/delautore", function(req, res) {
    const id = parseInt(req.body.id);
    sql="DELETE FROM Autori WHERE Autori.id="+id;
    db.run(sql);
    res.redirect('/admin/autori');
});

app.post("/modificalibri", function(req, res) {
    const id = parseInt(req.body.id);
    sql="UPDATE Libri SET titolo='"+req.body.titolo+"' WHERE Libri.id ="+id;
    db.run(sql);
    res.redirect('/admin/libri');
});

app.post("/addlibro", function(req, res) {
    const id = parseInt(req.body.id);
    sql="INSERT INTO Libri(titolo) VALUES('"+ req.body.titolo +"')";
    db.run(sql);
    res.redirect('/admin/libri');
});

app.post("/dellibro", function(req, res) {
    const id = parseInt(req.body.id);
    sql="DELETE FROM Libri WHERE Libri.id="+id;
    db.run(sql);
    res.redirect('/admin/libri');
});

app.post('/modrelazione',(req,res)=>{
    const id=parseInt(req.body.id);
    sql="UPDATE autori_libri SET id_autore='"+req.body.id_autore+"',id_libro='"+req.body.id_libro+"' WHERE autori_libri.id = "+id;
    console.log(sql)
    db.run(sql);
    res.redirect('/admin/relazioni');
});

app.post('/delrelazione',(req,res)=>{
    const id=parseInt(req.body.id);
    let sql = `DELETE FROM autori_libri WHERE autori_libri.id=${id}`;
    db.run(sql);
    res.redirect('/admin/relazioni');
});

app.post("/addrelazione", function(req, res) {
    sql="insert into autori_libri (id_autore, id_libro) values('"+req.body.id_autore+"','"+req.body.id_libro+"')";
    db.run(sql);
    res.redirect('/admin/relazioni');
});

app.use( function(req, res){
    res.status(404);
    res.sendFile(path.join (__dirname,"public","errore.html"));
});
