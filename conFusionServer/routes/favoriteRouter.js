const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({ "postedBy": req.user._id })
            .populate('postedBy')
            .populate('dishes')
            .exec(function (err, favs) {
                if (err) throw err;

                res.json(favs);

            });
    })
    .post(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ "postedBy": req.user._id }, function (err, favs) {
            if (!favs) {
                Favorites.create(req.body)
                    .then((favs) => {
                        favs[0].postedBy = req.user._id;
                        for (var i = 0; i < req.body.length; i++) {
                            if (favs[0].dishes.includes(req.body[i]._id)) {
                                console.log("dish is already in your favorites");
                            } else {
                                favs[0].dishes.push(req.body[i]._id);
                            }
                        }
                        favs[0].save()
                            .then((favs) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favs);
                            }, (err) => next(err));
                    }, (err) => next(err))
                    .catch((err) => next(err));
            } else {
                for (var i = 0; i < req.body.length; i++) {
                    favs.postedBy = req.user._id;
                    if (favs.dishes.includes(req.body[i]._id)) {
                        console.log("dish is already in your favorites");
                    } else {
                        favs.dishes.push(req.body[i]._id);
                    }
                }
                favs.save()
                    .then((favs) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favs);
                    }, (err) => next(err));
            }
        });
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        // Favorites.find({ "postedBy": req.user._id })
        Favorites.findOne({ "postedBy": req.user._id })
            .then(favorite => {
                if (favorite != null) {
                    favorite.dishes = favorite.dishes.filter(x => x.toString() != req.params.dishId)
                    favorite.save()
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }, (err) => next(err));
                }
                else {
                    err = new Error('Favorites not found!');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
favoriteRouter.route('/:favoriteId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /favorites/' + req.params.favoriteId);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ "postedBy": req.user._id }, function (err, favs) {
            if (!favs) {
                Favorites.create(req.body, function (err, favs) {
                    console.log("este es favs 2" + favs);
                    if (err) throw err;
                    favs.postedBy = req.user._id;
                    favs.dishes.push(req.params.favoriteId);
                    favs.save(function (err, favs) {
                        if (err) throw err;
                        console.log('Dish added');
                        res.json(favs);
                    });
                });
            } else {
                if (favs.dishes.includes(req.params.favoriteId)) {
                    var err = new Error('favorite added previously');
                    err.status = 401;
                    return next(err);
                } else {
                    favs.dishes.push(req.params.favoriteId);
                    favs.save(function (err, favs) {
                        if (err) throw err;
                        console.log('Dish added');
                        res.json(favs);
                    });
                }
            }
        });
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ "postedBy": req.user._id })
            .then((favs) => {

                var dishes = favs.dishes.filter(function (value, index, arr) {
                    return value != req.params.favoriteId;
                });
                favs.dishes = dishes;
                console.log("dishes after remove" + dishes);
                favs.save()
                    .then(favorite => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    }, (err) => next(err));
            }, (err) => { next(err) })
            .catch((err) => next(err));
    })

module.exports = favoriteRouter;