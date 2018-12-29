const express = require('express');
const bodyparser = require('body-parser');
const authenticate = require('../authenticate');
const promoRouter = express.Router();
const Promotions = require('../models/promotions');
promoRouter.use(bodyparser.json());

promoRouter.route('/')
    .all((req, res, next) => {
        next();
    })
    .get((req, res, next) => {
        Promotions.find({})
            .then((promotions) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotions);
            }, (err) =>
                    next(err)).catch((err) => next(err));
    })
    .post(authenticate.verifyUser,(req, res, next) => {
        Promotions.create(req.body)
            .then((promotion) => {
                console.log('Promotion created', promotion);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotion);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(authenticate.verifyUser,(req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /promotions , Sorry !');

    })
    .delete(authenticate.verifyUser,(req, res, next) => {
        Promotions.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

promoRouter.route('/:promoId')
    .get((req, res, next) => {
        Promotions.findById(req.params.promoId)
            .then((promotion) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotion);
            }, (err) =>
                    next(err)).catch((err) => next(err));
    })
    .post(authenticate.verifyUser,(req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /promotions/' + req.params.promoId);

    })
    .put(authenticate.verifyUser,(req, res, next) => {
        Promotions.findByIdAndUpdate(req.params.promoId, {
            $set: req.body
        }, { new: true })
            .then((promotion) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotion);
            }, (err) =>
                    next(err)).catch((err) => next(err));
    })
    .delete(authenticate.verifyUser,(req, res, next) => {
        Promotions.findByIdAndRemove(req.params.promoId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });



    
module.exports = promoRouter;