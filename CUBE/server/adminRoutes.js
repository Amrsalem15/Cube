const Router=require('express');
const router=Router();
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
const indexrouter=require("../server/index.js");
const bcrypt = require('bcrypt');
var session = require('express-session');




router.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    

  })
);





const Categories=require("../server/modules/categories");
const Partners=require("../server/modules/partners");
const Users=require("../server/modules/user");
const Projects=require("../server/modules/projects");

const requireAuth = (req, res, next) => {
  if (req.session.user) {
      next(); // User is authenticated, continue to next middleware
  } else {
      res.redirect('/login'); // User is not authenticated, redirect to login page
  }
}

router.get('/adminPartners',requireAuth,async function(req,res){
    var partners=[];
    var categories=[];
  try{
     partners=await Partners.find({});
     categories=await Categories.find({});
    // console.log(partners);

  }catch(e){
    console.log(e);

  }
    res.render('adminPartners.ejs',{partners,categories});
  
});



const storagePartner= multer.diskStorage({

  destination: function (req, file, cb) {
    const destinationPath = path.join(__dirname, "partner_images");
    console.log("Destination Path:", destinationPath);
    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    console.log(file);
    console.log("HI");
    const fileName = new Date().toISOString().replace(/[:.]/g, "") + file.originalname;
    console.log("Generated FileName:", fileName);
    cb(null, fileName);
  },
  
})
const uploadPartner =multer({storage:storagePartner});


router.post('/adminAddPartner',uploadPartner.single("image"), async function(req,res){
  try{
  
    console.log ("partner_images/"+req.file.filename);
    console.log(req.body.partnerName);
    const partner = new Partners({Title:req.body.partnerName,ImageName:req.file.filename});

  await partner.save().then(function(){
  console.log("Data inserted")  // Success
}).catch(function(error){
  console.log(error)      // Failure
});

const partners = await Partners.find({});
    res.json({ success: true, partners });

  }catch(e){
    console.log("add image");
    console.log(req.body.partnerName);

      }

 
});


router.post('/DeleteAdminPartner', async (req, res) => {
  const partnerID = req.body.partnerID;

  try {
    // Find the partner by title and delete it from the database
    const partner = await Partners.findOne({ _id: partnerID });

        if (!partner) {
          // Partner not found
          return res.status(404).json({ success: false, message: 'Partner not found' });
        }
    
    //     // Delete the partner from the database
        await Partners.deleteOne({ _id: partnerID  });

    //     // Delete the partner's image from the file system
    const imagePath = "partner_images/" + partner.ImageName;
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Error deleting file:');
      } else {
        console.log('File deleted successfully');
      }
    });
    console.log(`Deleted partner: ${partner.Title}`);
    res.json({ success: true});
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false });
  }
});

const storageCategory= multer.diskStorage({
 
  destination: function (req, file, cb) {
    const destinationPath = path.join(__dirname, "project_categotries_images");
    console.log("Destination Path:", destinationPath);
    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    console.log(file);
    console.log("HI");
    const fileName = new Date().toISOString().replace(/[:.]/g, "") + file.originalname;
    console.log("Generated FileName:", fileName);
    cb(null, fileName);
  },
})
const uploadCategory =multer({storage:storageCategory});


router.get('/adminCateogry',requireAuth,async function(req,res){
  var categories=[];
  try{
    categories=await Categories.find({});
    // console.log(categories);

  }catch(e){
    console.log(e);

  }
  res.render('adminCateogry.ejs',{categories});
});

router.post('/adminAddCategory',uploadCategory.single("image"), async function(req,res){
  try{
    const category = new Categories({Title:req.body.categoryName,ImageName:req.file.filename});
    console.log(req.body.categoryName);
   console.log(req.file.filename);
    await category.save().then(function(){  
    console.log("Data inserted")  // Success
    }).catch(function(error){
      console.log(error)      // Failure
    });
    res.json({ success: true });

  }catch(e){
    console.log("add image");
    console.log(req.body.categoryName);

    res.status(500).json({ success: false });
      }

});
router.post('/adminEditCategory',uploadCategory.single("image"), async function(req,res){
  try{
    const categoryName = req.body.categorySelect;   // Correctly access the 'categoryName' key
  console.log(req.file.filename); 
  console.log(categoryName);
await Categories.replaceOne( {Title: categoryName},{ImageName: req.file.filename,Title:categoryName}, {
},  console.log("Data inserted")  // Success
);
res.json({ success: true });
  }
  catch(e){
    console.log(e);
    res.status(500).json({ success: false });

  }
  
});
router.post('/adminEditNameCategory', async (req, res) => {
  const categoryOldName = req.body.categorySelectOldName;   // Correctly access the 'categoryName' key
  const categoryNewName = req.body.categoryNewName;   // Correctly access the 'categoryName' key
  try {
    const category = await Categories.findOne({ Title: categoryOldName });
    console.log(category);
    await Categories.replaceOne( {Title: categoryOldName},{Title:categoryNewName,ImageName:category.ImageName}, {
    },console.log("category "+categoryOldName+" changed to "+categoryNewName) // Success
    ); 
    res.json({ success: true });
  } 
  catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false });
  }

  }
);
router.post('/adminDeleteCategory', async (req, res) => {
    const categoryName = req.body.categorySelect;   // Correctly access the 'categoryName' key
    try {
        if(await Projects.findOne({Category:categoryName})){
          console.log("category not empty");
          res.json({ success: false });
        }

        else{
            const category = await Categories.findOne({ Title: categoryName });
            console.log(category);
            await Categories.deleteOne({ Title: categoryName });
            const imagePath = "project_categotries_images/" + category.ImageName;
            fs.unlink(imagePath, (err) => {
            if (err) {
                console.error('Error deleting file:');
            } else {
                console.log('File deleted successfully');
            }
            });
            console.log(`Deleted category: ${category.Title}`);
            res.json({ success: true });

        }

       
    } 
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false });
    }
    
    
});
router.get('/adminProjects',requireAuth,async function(req,res){
  var categories=[]; 
  try{
    categories=await Categories.find({});

  }catch(e){
    console.log(e);

  }

  res.render('adminProjects.ejs',{categories});
});
router.get('/adminEditProject',requireAuth,async function(req,res){
  var categories=[]; 
  var projects=[];
  try{
    categories=await Categories.find({});
    projects=await Projects.find({});

  }catch(e){
    console.log(e);

  }

  res.render('adminEditprojects.ejs',{categories,projects});
});



router.post('/login', async (req, res) => {
  
  const username = req.body.username;
  const password = req.body.pass;
  try {
  const user = await Users.findOne({ username: username });
  if (user == null) {
    res.redirect('/login');
  }else{
    console.log(user.Password);
    console.log(password);
    hashed = await bcrypt.hash(password, 10);
    console.log(hashed); 
    const validPassword = await bcrypt.compare(password,user.Password);
  
    console.log(validPassword);
      if (validPassword) {
        req.session.user = user;

        console.log(req.session.user);
        res.redirect('/adminPanel');
      } else {
        res.redirect('/login');
      }
    }}
    catch(e){
      console.log(e);
    }
  
});

router.get('/adminPanel',requireAuth,async function(req,res){
  
  
  var categories=[]; 
  var users=[];
  var username=req.session.user.username;

  try{
    categories=await Categories.find({});
    users=await Users.find({});

  }catch(e){
    console.log(e);

  }

  res.render('adminPanel.ejs',{categories,users,username});

});
router.post('/adminAddUser', async function(req,res){
  try{
    const checkuser = await Users.findOne({ username: req.body.username });
    if (checkuser) {
      console.log("user already exists");
      return res.json({ user: 'exists' });
        }
    else{
    const hashed= await bcrypt.hash(req.body.password, 10);
    console.log(hashed);
    const user = new Users({username:req.body.username,Password:hashed});
    Users.insertMany([user]).then(function(){
      console.log("Data inserted")  // Success
    });
    res.json({ success: true });
  }
}
  catch(e){
    console.log(e);
    res.status(500).json({ success: false });
    
  }
});
router.post('/adminChangePassword', async function(req,res){
  try{
    const username = req.session.user.username;
    const oldPassword = req.body.oldpassword;
    const newPassword = req.body.newpassword;
    console.log(username);
    console.log(oldPassword);
    console.log(newPassword);
    newPasswordHashed = await bcrypt.hash(newPassword, 10);
    if(await bcrypt.compare(oldPassword,req.session.user.Password)){
    await Users.findOneAndUpdate({ username: username }, { Password: newPasswordHashed });
    req.session.user.Password=newPasswordHashed;
    console.log("password changed");
  
    res.json({ success: true });
  }
  else{
    res.json({ password: false });
  }
  }
  catch(e){
    console.log(e);
     res.status(500).json({ success: false });
  }

});

router.post('/adminDeleteUser', async function(req,res){
  try{
    const id = req.body.id;
    console.log(id);
    await Users.deleteOne({ _id: id });
    res.json({ success: true });


    }
  catch(e){
    console.log(e);
    res.status(500).json({ success: false });

  }});

router.get('/adminEditproject-details',requireAuth,async function(req,res){
  var categories=[]; 
  var projects=[];
  const projectid =req.query.project  // Correctly access the 'projectTitle' key
  console.log("from the get id :"+projectid);

  try{
     categories=await Categories.find({});
      projects=await Projects.find({_id:projectid});
      var project=projects[0];
      console.log(project);
    // console.log(categories);
  }catch(e){
    console.log(e);
  }
    res.render('adminEditproject-details.ejs',{categories,project});
  

});
router.post('/adminEditproject-details', async function(req, res) {
     var projectTitle = req.body.projectTitle; // Correctly access the 'projectTitle' key
     var projectid = req.body.projectid; // Correctly access the 'projectTitle' key
    console.log("from the post : "+ projectTitle);
    console.log("from the post id : "+ projectid);

   
    res.redirect('/adminEditproject-details?project=' + projectid);
  });
  const storageProjects = multer.diskStorage({
    destination: function (req, file, cb) {
      const destinationPath = path.join(__dirname, "projects_images");
      console.log("Destination Path:", destinationPath);
      cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
      console.log(file);
      console.log("HI");
      const fileName = new Date().toISOString().replace(/[:.]/g, "") + file.originalname;
      console.log("Generated FileName:", fileName);
      cb(null, fileName);
    },
  });
  
  
  
  
const uploadProjects =multer({storage:storageProjects});


router.post('/adminAddProject',uploadProjects.array("image",7), async function(req,res){
  try{
    const title=req.body.title;
    const Client=req.body.Client;
    const category=req.body.category;
    const Date=req.body.Date;
    const description=req.body.description;
    const files = req.files;

    const project = new Projects({
      Title:title,
      Description:description,
      CoverImage:files[0].filename,
      Category:category,
      Client:Client,
      Date:Date,
      SliderImages:files.slice(1).map((file) => file.filename),
    });
    Projects.insertMany([project]).then(function(){
      console.log("Data inserted")  // Success
    });

      res.json({ success: true });
  }
  catch(e){
    console.log(e);
    res.status(500).json({ success: false });

  }




});
router.post("/adminDeleteproject", async function(req,res){
  const projectID = req.body.projectID;
  console.log(projectID);
  try{
    const project = await Projects.findOne({ _id: projectID });
    console.log(project);
    await Projects.deleteOne({ _id: projectID });
    const imagePath = "projects_images/" + project.CoverImage;
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Error deleting file:');
      } else {
        console.log('File deleted successfully');
      }
    });
    project.SliderImages.forEach((image) => {
      const imagePath = "projects_images/" + image;
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting file:');
        } else {
          console.log('File deleted successfully');
        }
      });
    });
    console.log(`Deleted project: ${project.Title}`);
    res.json({ success: true });

  }
  catch(e){

  }

});
app.get('/service-details',async(req,res) =>{
  var categories=[];
  try{
     categories=await Categories.find({});
  }catch(e){
    console.log(e);
  }
  res.render('service-details.ejs',{categories})
});


router.post("/logout", async function(req,res){
  console.log("logout");
  req.session.destroy();
  res.redirect('/login');
});
router.post("/adminEditTitleProject",async function(req,res){
  console.log(req.body);
  const projectID = req.body.ID;
  const oldTitle = req.body.oldTitle;
  const newTitle = req.body.newTitle;
  console.log(projectID);
  console.log(oldTitle);
  console.log(newTitle);
  try{
    const project = await Projects.findOne({ _id:projectID});
    console.log(project);
    await Projects.updateOne(
      { _id: projectID },
      { $set: { Title: newTitle } }
    ), 
    console.log("project "+oldTitle+" changed to "+newTitle) // Success
     
    res.json({ success: true });

  }
  catch(e){
    res.json({ success: false });

  }
})
router.post("/adminEditDescriptionProject",async function(req,res){
const projectID = req.body.ID;
const newDescription = req.body.newDescription;
try{
  const project = await Projects.findOne({ _id:projectID});
  console.log(project);
  await Projects.updateOne(
    { _id: projectID },
    { $set: { Description: newDescription } }
  ), 
  console.log("project Description changed to "+newDescription) // Success
   
  res.json({ success: true });

}
catch(e){
  res.json({ success: false });

}
});
router.post("/adminEditCategoryProject",async function(req,res){
  const projectID = req.body.ID;
  const newCategory = req.body.newCategory;
  console.log(projectID);
  console.log(newCategory);
  try{
    const project = await Projects.findOne({ _id:projectID});
    console.log(project);
    await Projects.updateOne(
      { _id: projectID },
      { $set: { Category: newCategory } }
    ),
    console.log("project Category changed to "+newCategory) // Success
    res.json({ success: true });
    
  
  }
  catch(e){
    res.json({ success: false });
  
  }

});
router.post("/adminEditClientProject",async function(req,res){
const projectID = req.body.ID;
const newClient = req.body.newClient;
console.log(projectID);
console.log(newClient);
try{
  const project = await Projects.findOne({ _id:projectID});
  console.log(project);
  await Projects.updateOne(
    { _id: projectID },
    { $set: { Client: newClient } }
  ),
  console.log("project Client changed to "+newClient) // Success
  res.json({ success: true });
  }catch(e){
  res.json({ success: false });
  }
}

);
router.post("/adminEditDateProject",async function(req,res){

const projectID = req.body.ID;
const newDate = req.body.newDate;
console.log(projectID);
console.log(newDate);
try{
  const project = await Projects.findOne({ _id:projectID});
  console.log(project);
  await Projects.updateOne(
    { _id: projectID },
    { $set: { Date: newDate } }
  ),
  console.log("project Date changed to "+newDate) // Success
  res.json({ success: true });
  }catch(e){
  res.json({ success: false });
  }
});
router.post("/adminDeleteImageProject",async function(req,res){
const projectID = req.body.ID;
const image = req.body.imageNameToDelete;
console.log(projectID);
console.log(image);
try{
  const project = await Projects.findOne({ _id:projectID});
  console.log(project);
  await Projects.updateOne(
    { _id: projectID },
    { $pull: { SliderImages: image } }
  ),
  console.log("project image deleted from database") // Success

  const imagePath = "projects_images/" + image;
  fs.unlink(imagePath, (err) => {
    if (err) {
      console.error('Error deleting file:');
    } else {
      console.log('File deleted successfully');
    }
  });
  console.log(`Deleted image from files: ${image}`);
  res.json({ success: true });
  }

catch(e){
  res.json({ success: false });

}

});
router.post("/adminAddImageProject", uploadProjects.single("projectImage"), async function (req, res) {
 
  // Handle the uploaded file and other form data as needed
  const projectID = req.body.ID;
  const image = req.file.filename;
  console.log(projectID);
  console.log(image);
  try{
    const project = await Projects.findOne({ _id:projectID});
  console.log(project);
  await Projects.updateOne(
    { _id: projectID },
    { $push: { SliderImages: image } }
  ),
  console.log("project image deleted from database") // Success

  const imagePath = "projects_images/" + image;
  console.log(imagePath);
  res.json({ success: true });

  }catch(e){
    res.json({ success: false });


  }
});
router.post("/sendmailindex",async function(req,res){
  console.log(req.body);
  const email=req.body.email;
  const message=req.body.message;
  const phone=req.body.phone;
  console.log(email);
  console.log(message);
  console.log(phone);
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'amrsalem2468@gmail.com',  // Your email address
      pass: 'dxgh koyz adwr igeh',   // Your email password or an app-specific password
    },
  });

  // Email message options
const mailOptions = {
  from:email,   // Sender's email address
  to: 'amrsalem2468@gmail.com',    // Recipient's email address
  subject: 'sent from the website Email: ' + email, // Email subject    // Email subject
  text: `${message}\n\nPhone number: ${phone}`,  // Email content (plain text)
};
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error sending email:', error);
    res.json({ success: false });
  } else {
    console.log('Email sent:', info.response);
    res.json({ success: true });
  }
})
});
router.post("/sendmailcontactus",async function(req,res){
  console.log(req.body);
  const email=req.body.email;
  const message=req.body.message;
  const subject=req.body.subject;
  console.log(email);
  console.log(message);
  console.log(subject);
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'amrsalem2468@gmail.com',  // Your email address
      pass: 'dxgh koyz adwr igeh',   // Your email password or an app-specific password
    },
  });

  // Email message options
const mailOptions = {
  from:email,   // Sender's email address
  to: 'amrsalem2468@gmail.com',    // Recipient's email address
  subject: subject, // Email subject    // Email subject
  text: `${message}\n\n\nfrom: ${email}`,  // Email content (plain text)
};
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error sending email:', error);
    res.json({ success: false });
  } else {
    console.log('Email sent:', info.response);
    res.json({ success: true });
  }
})
});
router.post("/adminChangeCoverPhoto",uploadProjects.single("projectImage"),async function(req,res){
  // console.log(req.body);
  const projectID = req.body.projectID;
  const oldCoverImage = req.body.coverImage;
 
console.log(projectID);
console.log(oldCoverImage);
try{
  const newCoverImage = req.file.filename;
  console.log(newCoverImage);

  const project = await Projects.findOne({ _id:projectID});
  console.log(project);
  await Projects.updateOne(
    { _id: projectID },
    { $set: { CoverImage: newCoverImage } }
  ),
  console.log("project CoverImage changed to "+newCoverImage) // Success

  const imagePath = "projects_images/" + oldCoverImage;
  fs.unlink(imagePath, (err) => {
    if (err) {
      console.error('Error deleting file:');
    } else {
      console.log('File deleted successfully');
    }
  });
  console.log(`Deleted image from files: ${oldCoverImage}`);
  res.json({ success: true });
  }
  catch(e){
    res.json({ success: false });

  }


});

module.exports=router;