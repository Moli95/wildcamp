var express 	= require("express"),
	router		= express.Router({mergeParams: true}),
	Camping 	= require("../models/camping"),
	middleware	= require("../middleware");
const { check, validationResult } = require('express-validator/check');


router.get("/", function(req, res){
	Camping.find({}, function(err, allCampings){
		if(err){
			console.log(err);
		} else{
			res.render("campings/index", {camping: allCampings, currentUser: req.user});
		}
	});
});

router.post("/", middleware.isLoggedIn, [
	check('camping.name', "Name must be at leat 5 chars long").isLength({min: 5}),
	check('camping.image', "You have to upload an image").isLength({min: 5}),
	check('camping.description', "Description can't be blank").isLength({min: 1})
	], function(req, res){
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		var message = errors.array().map(function (elem){
			return elem.msg;
		});
		req.flash("error", message);
		return res.redirect("/campings");
	}
	var name = req.body.camping.name;
	var image = req.body.camping.image;
	var desc = req.body.camping.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	var lat = req.body.camping.lat;
	var lng = req.body.camping.lng;

	var newCamping = {name: name, image: image, description: desc, author: author, lat: lat, lng: lng};

	Camping.create(newCamping, function(err, newCamp){
		if(err){
			console.log(err);
		} else{
			res.redirect("/campings");
		}
	});
});

router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campings/new")
});

router.get("/:id", function(req, res){
	Camping.findById(req.params.id).populate("comments").exec(function(err, foundCamp){
		if(err){
			console.log(err);
		} else{
			res.render("campings/show", {camping: foundCamp});
		}
	});
});

router.get("/:id/edit", middleware.isAuthorizedCamp, function(req, res){
	Camping.findById(req.params.id, function(err, foundCamp){
		if(err){
			console.log(err);
			res.redirect("back");
		}else{
			res.render("campings/edit", {camping: foundCamp});
		}
	});
});

router.put("/:id", middleware.isAuthorizedCamp, function(req, res){
	Camping.findByIdAndUpdate(req.params.id, req.body.camping, function(err, updatedBlog){
		if(err){
			res.redirect("/campings")
		}else{
			res.redirect("/campings/" + req.params.id);
		}
	});
});

router.delete("/:id", middleware.isAuthorizedCamp, function(req, res){
	Camping.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/campings");
		} else{
			res.redirect("/campings");
		}
	});
});




module.exports = router;