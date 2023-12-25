import { Request, Response } from "express";
import { PaymentInterface } from "../interfaces/paymentInterface";
const Razorpay = require("razorpay");
const {
  insertPaymentData,
  getAllPaymentsData,
} = require("../database/database");
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY, RECEIPT_EMAIL } = process.env;

export const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_ID_KEY,
  key_secret: RAZORPAY_SECRET_KEY,
});

export const getAllPayments = async (
  req: Request<{}, {}, PaymentInterface>,
  res: Response
) => {
  try {
    await getAllPaymentsData();
  } catch (err) {
    throw err;
  }
};

export const createPayment = async (
    req: Request<{}, {}, PaymentInterface>,
    res: Response
  ) => {
    try {
      const amount = req.body.amount;
      const options = {
        amount: amount,
        currency: 'INR',
        receipt: RECEIPT_EMAIL,
      };
      const userDetails = {
        contact: req.body.contact,
        name: req.body.name,
        email: req.body.email,
      };
  
      // Use Promise.all to execute both asynchronous tasks concurrently
      const [order, paymentResult] = await Promise.all([
        createRazorpayOrder(options),
        savePaymentData(amount, userDetails),
      ]);
  
      // Handle errors if any
      if (order.error || paymentResult.error) {
        const errorMessage = order.error || paymentResult.error;
        console.error('Error:', errorMessage);
        return res.status(500).send({
          success: false,
          message: 'Internal Server Error',
          error: errorMessage,
        });
      }
  
      // Both tasks completed successfully
      res.status(200).send({
        success: true,
        message: 'Payment Successful!',
        order_id: order.id,
        amount: amount,
        key_id: RAZORPAY_ID_KEY,
        contact: userDetails.contact,
        name: userDetails.name,
        email: userDetails.email,
      });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).send({
        success: false,
        message: 'Internal Server Error',
        error:'Unknown Error',
      });
    }
  };
  
  // Function to create a Razorpay order
  const createRazorpayOrder = (options: any): Promise<any> => {
    return new Promise((resolve) => {
      razorpayInstance.orders.create(options, (err: any, order: any) => {
        if (err) {
          resolve({ error: err.message || 'Internal Server Error' });
        } else {
          resolve({ id: order.id });
        }
      });
    });
  };
  
  // Function to save payment data to the database
  const savePaymentData = async (
    amount: number,
    userDetails: { contact?: string; name?: string; email: string }
  ): Promise<any> => {
    try {
      const paymentData = {
        amount,
        contact: userDetails.contact,
        name: userDetails.name,
        email: userDetails.email,
      };
  
      const result = await insertPaymentData(paymentData);
      return { success: true, result };
    } catch (error) {
      throw error;
    }
  };
