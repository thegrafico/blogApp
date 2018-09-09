//import all class tha we gonna use
var express 			= require("express"), //servidor
	mongoose 			= require("mongoose"), //DB
	expressSanitizer 	= require("express-sanitizer"); //clean all inputs 
	methodOverride 	= require("method-override"), // para hacer put y remove request en los form de HTML
	bodyParse 			= require("body-parser"); //pasar datos a traves de URL y archvios

//transforn express to use it
var app = express();		

//======================SETUP==================================
//create or use own dataBS
mongoose.connect("mongodb://localhost:27017/restfull_blog_app");
//para que node sepa que todos los archivos van a ser .ejs
app.set("view engine", "ejs");
//para que use esta carpeta AQUI SE CARGAN LOS LINKS CSS QUE TENGAMOS
app.use(express.static("public"));
//para que podamos pasar data a traves de url
app.use(bodyParse.urlencoded({extended: true}));
//para que express use el method override para los request, lo que esta en "" es lo que va a buscar
app.use(methodOverride("_method"));
//para limpiar los inputs de lo que ingrese el usuario, para que no lea tags de html y js
app.use(expressSanitizer());
//=============================================================

//the shema or structure of the date we gonna save in the DB
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	Create: {type: Date, default: Date.now} //crea el DATE y toma el defaul value que es la hora en que se creo
});

//El modelo de la DB que vamos a usar. con este objeto podemos guardar, borrar y actualizar todo en la DB
var Blog = mongoose.model("Blog", blogSchema); 

// //create blog test
// Blog.create({
// 	title: "Test 0.1",
// 	image: "IMAGENLOCA",
// 	body: "balasndkasddasdkasdjaskldjaskldjaskldjaskldjklsjdklajskdjskljaklkasjkdjaslkdjaskldjasldjas"
// });

//=================RESTful ROUTES===============================
//Pagina de inicio
app.get("/", function(req, res){
	res.redirect("/blogs");
});

 //INDEX ROUTE
app.get("/blogs", function(req, res){

	//find our blogs in the DB and show it
	Blog.find({}, function(err, blogs){
		if(!err){
			//va a cargar el archivo index
			res.render("index", {blogs: blogs});			
		}
	});

});

//NEW ROUTE
app.get("/blogs/new", function(req, res){
	res.render("new");
});

//CREATE ROUTE
app.post("/blogs", function(req, res){
	//var data = req.body.blog ; //aqui esta toda la info = title, image, text
	//===================SANITIZER INPUT==================
	req.body.blog.title = req.sanitize(req.body.blog.title);
	req.body.blog.image = req.sanitize(req.body.blog.image);
	req.body.blog.body = req.sanitize(req.body.blog.body);
	//====================================================
	Blog.create(req.body.blog, function(err, newBlog){
		//si hay error
		if(err){
			res.render("new");
		}else{
			//rediret to index		
			res.redirect("/blogs");
		}
	});
});

//SHOW ROUTE
app.get("/blogs/:id", function(req, res){
	//get the ID in the URL
	var id = req.params.id;
	//find the element with the ID in the DB
	Blog.findById(id, function(err, foundBlog){
		//si no hay error
		if(!err){
			//si no hay error nos lleva la pagina show.ejs y con la infacion del blog encontrado
			res.render("show", {blog: foundBlog});
		}else
			res.redirect("/blogs");
	});
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
	//get the ID in the URL
	var id = req.params.id;
	//find the element with the ID in the DB
	Blog.findById(id, function(err, foundBlog){
		//si hay error
		if(err){
			res.redirect("/blogs");	
		}else{
			res.render("edit", {blog: foundBlog});
		}
	});
});

//UPDATE ROUTE -- this update the post
app.put("/blogs/:id", function(req, res){

	//get the element ID from the url
	var id = req.params.id;

	//===================SANITIZER INPUT==================
	req.body.blog.title = req.sanitize(req.body.blog.title);
	req.body.blog.image = req.sanitize(req.body.blog.image);
	req.body.blog.body = req.sanitize(req.body.blog.body);
	//====================================================

	//como su nombre lo dice
	Blog.findByIdAndUpdate(id, req.body.blog, function(err, updateBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs/" + id); //rediret to the show page
		}
	});
});

//DELETE ROUTE
app.delete("/blogs/:id", function(req, res){

	//destroy blog
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs");
		}
	});
	//redirect

});

//THE MOST IMPORTAN LINE, connect to a host to run
app.listen(2000, process.env.IP, function(){
	console.log("SERVER UP!"); 
});
//=======================================================

// =========WE GONNA HAVE ======
// title
// images
// body
//created date 