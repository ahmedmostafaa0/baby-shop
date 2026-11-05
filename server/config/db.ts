import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("Missing MongoDB connection string (MONGO_URI or MONGODB_URI)");
    }
    const conn = await mongoose.connect(mongoUri);
    console.log(`Mongo Connected: ${conn.connection.host}`)
  } catch (error) {
    if(error instanceof Error){
      console.log(`Error: ${error.message}`);
    }else{
      console.log('Unknown error while connecting to MongoDB')
    }
    process.exit(1)
  }
};

export default connectDB;
