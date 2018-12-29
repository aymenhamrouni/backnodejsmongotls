const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');

const Dishes = require('../models/dishes');
const cors = require('./cors');
const dishRouter = express.Router();
const authenticate = require('../authenticate');
dishRouter.use(bodyparser.json());

dishRouter.route('/')
.options(cors.corsWithOptions,(req,res)=>{
    res.sendStatus(200);
})
.get(cors.cors,(req, res, next) => { //all users can perform get request on /dishes
        Dishes.find({})
            .populate('comments.author')
            .then((dishes) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dishes);
            }, (err) =>
                    next(err)).catch((err) => next(err));
    })
    .post(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //only and admin can post a dish
        Dishes.create(req.body)
            .then((dish) => {
                console.log('Dish created', dish);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //doesnt work but still ,only admin can access this
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes , Sorry !');

    })
    .delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {// only admin can access this
        Dishes.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

dishRouter.route('/:dishId')
.options(cors.corsWithOptions,(req,res)=>{
    res.sendStatus(200);
})
    .get(cors.cors,(req, res, next) => { //every one can do this
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) =>
                    next(err)).catch((err) => next(err));
    })
    .post(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //it's not supported but still only an admin can acess this
        res.statusCode = 403;
        res.end('POST operation not supported on /dishes/' + req.params.dishId);

    })
    .put(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //only an admin can modify a dish
        Dishes.findByIdAndUpdate(req.params.dishId, {
            $set: req.body
        }, { new: true })
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) =>
                    next(err)).catch((err) => next(err));
    })
    .delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {//only an admin can delete a specific dish
        Dishes.findByIdAndRemove(req.params.dishId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

dishRouter.route('/:dishId/comments')
.options(cors.corsWithOptions,(req,res)=>{
    res.sendStatus(200);
})
    .all((req, res, next) => {
        next();
    })
    .get(cors.cors,(req, res, next) => { //anyone ca see dishes comments 
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dish) => {
                if (dish != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish.comments);
                } else {
                    err = new Error('Dish ' + req.params.dishId + ' NOT found');
                    err.status = 404;
                    return next(err)
                }

            }, (err) =>
                    next(err)).catch((err) => next(err));
    })
    .post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {//only a user can post comments
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                if (dish != null) {
                    req.body.author = req.user._id;
                    dish.comments.push(req.body);
                    dish.save()
                        .then((dish) => {
                            Dishes.findById(dish._id)
                                .populate('comments.author')
                                .then((dish) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(dish);
                                })

                        })

                } else {
                    err = new Error('Dish ' + req.params.dishId + ' NOT found');
                    err.status = 404;
                    return next(err)
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => { // only user also can see this 
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes/' + req.params.dishId + '/comments , Sorry !');

    })
    .delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {//only admin can delete all comments
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                if (dish != null) {
                    for (var i = (dish.comments.length - 1); i >= 0; i--) {
                        dish.comments.id(dish.comments[i].id).remove();
                    }
                    dish.save()
                        .then((dish) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(dish);
                        })

                } else {
                    err = new Error('Dish ' + req.params.dishId + ' NOT found');
                    err.status = 404;
                    return next(err)
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

dishRouter.route('/:dishId/comments/:commentId')
.options(cors.corsWithOptions,(req,res)=>{
    res.sendStatus(200);
})
.get(cors.cors,(req, res, next) => {//anyone can see a specifique comment
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dish) => {
                if (dish != null && dish.comments.id(req.params.commentId) != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish.comments.id(req.params.commentId));
                } else if (dish = null) {
                    err = new Error('Dish ' + req.params.dishId + ' NOT found');
                    err.status = 404;
                    return next(err)
                }
                else {
                    err = new Error('Comment ' + req.params.commentId + ' NOT found');
                    err.status = 404;
                    return next(err)
                }
            }, (err) =>
                    next(err)).catch((err) => next(err));
    })
    .post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {//only users can see this
        res.statusCode = 403;
        res.end('POST operation not supported on /dishes/' + req.params.dishId + 'comments/' + req.params.commentId);

    })
    .put(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => { //only the user who submitted the comment can modify it
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dish) => {

                if (dish != null && dish.comments.id(req.params.commentId) != null) {
                    if ((dish.comments.id(req.params.commentId).author._id).equals(req.user._id)) {
                        if (req.body.rating) {
                            dish.comments.id(req.params.commentId).rating = req.body.rating;
                        }
                        if (req.body.comment) {
                            dish.comments.id(req.params.commentId).comment = req.body.comment;
                        }
                        dish.save()
                            .then((dish) => {
                                Dishes.findById(dish._id)
                                    .populate('comments.author')
                                    .then((dish) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(dish);
                                    })

                            }, (err) => next(err));
                    } else {
                        var err = new Error('You are not authorized to perform this operation!');
                        err.status = 403;
                        return next(err);
                    }

                } else if (dish == null) {
                    err = new Error('Dish ' + req.params.dishId + ' NOT found');
                    err.status = 404;
                    return next(err)
                }
                else {
                    err = new Error('Comment ' + req.params.commentId + ' NOT found');
                    err.status = 404;
                    return next(err)
                }
            }, (err) =>
                    next(err)).catch((err) => next(err));
    })
    .delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dish) => {

                if (dish != null && dish.comments.id(req.params.commentId) != null) {
                    if ((dish.comments.id(req.params.commentId).author._id).equals(req.user._id)) {
                        dish.comments.id(req.params.commentId).remove();
                        dish.save()
                            .then((dish) => {
                                Dishes.findById(dish._id)
                                    .then((dish) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(dish);
                                    })
                            }, (err) => next(err))
                    }
                    else {
                        var err = new Error('You are not authorized to perform this operation!');
                        err.status = 403;
                        return next(err);
                    }


                } else if (dish == null) {
                    err = new Error('Dish ' + req.params.dishId + ' NOT found');
                    err.status = 404;
                    return next(err)
                }
                else {
                    err = new Error('Comment ' + req.params.commentId + ' NOT found');
                    err.status = 404;
                    return next(err)
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });


module.exports = dishRouter;