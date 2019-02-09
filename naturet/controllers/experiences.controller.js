const createError = require("http-errors");
const mongoose = require("mongoose");
const Experience = require("../models/experience.model");
const User = require("../models/user.model");
const passport = require("passport");
const Comment = require("../models/comment.model");

module.exports.comment = (req, res, next) => {
 res.render("experiences/detail");
 
};

module.exports.doComment = (req, res, next) => {

 const commentData = {
   message: req.body.message,
   user: req.user.id,
   experience: req.params.id,
 };

 const comment = new Comment(commentData);
 
 return comment
   .save()
   .then(()=> {
     res.redirect("/profile");
   })
   .catch(error => next(error));
};

module.exports.get = (req, res, next) => {
  const id = req.params.id;
  Experience.findById(id)
    .populate('user')
    .populate('comments')
    .then(experience => {
      console.log(experience.comments)
      res.render('experiences/detail', {
        experience,
        pointsJSON: encodeURIComponent(JSON.stringify(experience.location.coordinates))
      })
    })
    .catch(err => next(err));
}

module.exports.delete = (req, res, next) => {
  const id = req.params.id;
  Experience.findByIdAndDelete(id)
    .populate("user")
    .then(experience => res.redirect('/profile'))
    .catch(err => next(err));
}

module.exports.create = (req, res, next) => {
  res.render("experiences/form");
};

module.exports.doCreate = (req, res, next) => {

  if (req.body.path) {
    req.body.path = req.body.path.map(x => x.split(",").map(n => Number(n)));
  } 

  const experienceData = {
    name: req.body.name,
    description: req.body.description,
    anymore: req.body.anymore,
    price: req.body.price,
    photo: req.body.photo,
    categories: req.body.categories,
    languages: req.body.languages,
    duration: req.body.duration,
    includes: req.body.includes,
    photos: req.files ? req.files.map(file => file.secure_url) : '',
    location : {
      type: "LineString",
      coordinates: req.body.path  
    }
  };


  const categories = typeof (req.body.categories) === 'string' ? [req.body.categories] : req.body.categories;
  
  const name = req.body.name;
  const description = req.body.description;
  const price = req.body.price;

  if ( !categories || categories.length <= 3 || !name || !price || !description || !req.body.path )  {

      res.render('experiences/form', {
        name,
        categories: categories,
        price,
        description,
        ...(req.body.path ? { pointsJSON: encodeURIComponent(JSON.stringify(req.body.path)) } : null),
        errors: {
          ...(!categories || categories.length <= 3 ? { categories: 'Choose at least 4 categories' } : null),
          name: name ? undefined : 'Select one name for your experience',
          description: description ? undefined : 'Add some awesome description to your experience',
          price: price ? undefined : 'Select some price to your experience from 0 to your choice',
          bodyPath: 'No hay ruta'
        }
      });
  } else {
  
  const experience = new Experience(experienceData);
  experience.user = req.user._id;
  return experience
  .populate('comments') //esto no es seguro hay que hablarlo con carlos
    .save()
    .then(experience => {
      res.redirect("/profile");
    })
    .catch(error => next(error));
}
};


module.exports.unFollow = (req, res, next) => {
  const id = req.params.id;
  Experience.findById(id)
      .populate('following')
      .populate('user')
      .then(experience =>  {  
          if (!experience) {
              next();
          } else {
            
          return User.findByIdAndUpdate(req.user.id, {
                $pull: { following: experience.id }
              })
              .populate('following')
              .populate('experience')
              .then(() => res.redirect("/profile/"))
        }
      })
      .catch(error => next(error));
 }
 
 module.exports.follow = (req, res, next) => {
  const id = req.params.id;
  Experience.findById(id)
      .populate('following')
      .then(experience =>  {
          if (!experience) {
              next();
          } else {
          return  User.findByIdAndUpdate(req.user.id, {
              $addToSet: { following: experience.id }
            })
            .populate('following')
            .populate('experience')
            .then(() => res.redirect("/profile/"))
          }
      })
      .catch(error => next(error));
 }
 module.exports.purchased = (req, res, next) => {
  const id = req.params.id;
  Experience.findById(id)
      .populate('purchased')
      .then(experience =>  { 
          if (!experience) {
              next();
          } else {
          return  User.findByIdAndUpdate(req.user.id, {
              $addToSet: { purchased: experience.id }
            })
            .populate('purchased')
            .populate('experience')
            .then(() => res.redirect("/profile/"))
          }
      })
      .catch(error => next(error));
 }
