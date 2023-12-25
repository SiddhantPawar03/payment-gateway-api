import express from 'express';
export const paymentRoute = express();

const path = require('path');
const paymentController = require('../controllers/paymentController');

paymentRoute.get('/getAllPayments', paymentController.getAllPayments);
paymentRoute.post('/createPayment', paymentController.createPayment);

