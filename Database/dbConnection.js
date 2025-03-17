import mongoose from "mongoose";
import env from "dotenv"
env.config();
console.log("Database url: ",process.env.DATABASE_URL)

export function dbConnection() {
  mongoose
    .connect(process.env.DATABASE_URL || `mongodb+srv://ecommerce:ecommerce123@cluster0.b649qmo.mongodb.net/Ecommerce-App`)
    .then(() => {
      console.log("DB Connected Succesfully");
    })
    .catch((error) => {
      console.log("DB Failed to connect", error);
    });
}


//Use this is postman https://ecommerce-backend-codv.onrender.com/api/v1/auth/signup

