const axios=require("axios");
const express =require("express");
const mongoose =require("mongoose")
var favicon = require('serve-favicon');
const multer =require('multer');
const bodyParser = require('body-parser');
const path=require('path');
const app= express();
const fs = require('fs');
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const adminrouter=require("../server/adminRoutes.js");




app.use(express.json());
const servernum=1990;



app.use(express.static("../server"));
app.use(favicon(__dirname + "/assets/img/Picture1.png"));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine','ejs');

app.use(adminrouter);



mongoose.connect("mongodb+srv://amrsalem2468:CubeCube@cluster0.imuu7kk.mongodb.net/Cube?retryWrites=true&w=majority",{
    useNewUrlParser:true 
    ,
}  ,console.log("database is connected")
);
const PORT = process.env.PORT || 3030;

// your code

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});




const Partners=require("./modules/partners");
const Categories=require("./modules/categories");
const Projects=require("./modules/projects");
const Users=require("./modules/user");


app.get('/',async function(req,res){
  var partners=[];
  var categories=[];
  
  try{
     partners=await Partners.find({});
     categories=await Categories.find({});
    console.log(partners);
    console.log(categories);


  }catch(e){
    console.log(e);

  }
  
  res.render('index.ejs',{partners,categories});
});

app.get('/about',async(req,res) =>{
  var categories=[];
  try{
     categories=await Categories.find({});
    console.log(categories);
  }catch(e){
    console.log(e);
  }
    res.render('about.ejs',{categories});
  });
  app.get('/blog',async(req,res) =>{
    var categories=[];
    try{
       categories=await Categories.find({});
      console.log(categories);
    }catch(e){
      console.log(e);
    }
      res.render('blog.ejs',{categories});
    });
  


app.get('/index',async function(req,res){
  var partners=[];
  var categories=[];
  
  try{
     partners=await Partners.find({});
     categories=await Categories.find({});
    // console.log(partners);
    // console.log(categories);


  }catch(e){
    console.log(e);

  }
  
  res.render('index.ejs',{partners,categories});
  });

app.get('/project-details',async(req,res) =>{
  var categories=[];
  var projects;
  const projectid =req.query.project  // Correctly access the 'projectTitle' key
  console.log("from the get :"+projectid);

  try{
     categories=await Categories.find({});
      projects=await Projects.find({_id:projectid});
      var project=projects[0];
      console.log(project);
    // console.log(categories);
  }catch(e){
    console.log(e);
  }
    res.render('project-details.ejs',{categories,project});
  });
  
  app.post('/project-details',async(req,res) =>{
    var projectTitle = req.body.projectTitle; // Correctly access the 'projectTitle' key
    var projectid = req.body.projectid; // Correctly access the 'projectTitle' key
    console.log("from the post : "+ projectTitle);
    console.log("from the post id : "+ projectid);
    res.redirect('/project-details?project=' + projectid);

    });

app.get('/projects',async function(req,res){
  var categories=[];
  var projects=[];
  const category = req.query.category; // Correctly access the 'category' key
  console.log("from the get "+ category);
  
  try{
    categories=await Categories.find({});
    projects=await Projects.find({});
    // console.log(categories);
    // console.log(projects);
  }
  catch(e){
    console.log(e);
  }
  res.render('projects.ejs',{categories,projects,category});
  

  });
  
  
  app.post('/projects', async function(req, res) {
  var categories=[];
  var projects=[];
  var category = req.body.category; // Access the "category" value from the form data
  try{
    categories=await Categories.find({});
    projects=await Projects.find({});
    // console.log(categories);
    // console.log(projects);
  }
  catch(e){
    console.log(e);
  }
  console.log("from the post : "+ category);

  res.redirect('/projects?category=' + category);
  });
  
  app.get('/contact',async(req,res) =>{
    var categories=[];
    try{
       categories=await Categories.find({});
      console.log(categories);
    }catch(e){
      console.log(e);
    }
    res.render('contact.ejs',{categories});
  });

  app.get('/services',async(req,res) =>{
    var categories=[];
    try{
       categories=await Categories.find({});
      console.log(categories);
    }catch(e){
      console.log(e);
    }
    res.render('services.ejs',{categories});
  });

  app.get('/sample-inner-page',async(req,res) =>{
    var categories=[];
    try{
       categories=await Categories.find({});
      console.log(categories);
    }catch(e){
      console.log(e);
    }
    res.render('sample-inner-page.ejs',{categories});
  });

   app.get('/service-details',async(req,res) =>{
    var categories=[];
    try{
       categories=await Categories.find({});
    //  console.log(categories);
    }catch(e){
      console.log(e);
    }
    res.render('service-details.ejs',{categories})
  });
  
   app.get('/login',async(req,res) =>{
    var categories=[];
    try{
       categories=await Categories.find({});
    //  console.log(categories);
    }catch(e){
      console.log(e);
    }

    res.render('login.ejs',{categories})
  });

  