import express from "express";
import { paymentRoute } from "./routes/paymentRoute";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use("/payment", paymentRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
