import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Ekart-YT";
    const hasDatabaseName = /mongodb(?:\+srv)?:\/\/.+\/[^/?]+(?:\?|$)/.test(
      mongoUri,
    );
    const connectionString = hasDatabaseName
      ? mongoUri
      : `${mongoUri.replace(/\/$/, "")}/Ekart-YT`;

    await mongoose.connect(connectionString);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
};

export default connectDB;
