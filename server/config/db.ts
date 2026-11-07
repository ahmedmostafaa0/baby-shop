import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("Missing MongoDB connection string (MONGO_URI or MONGODB_URI)");
    }
    const conn = await mongoose.connect(mongoUri);
    const database = conn.connection.db;
    if (!database) {
      throw new Error("MongoDB connection is missing its database handle");
    }
    const topology = await database.admin().command({ hello: 1 });
    if (typeof topology.setName !== "string") {
      throw new Error(
        "MongoDB replica set is required: configure Atlas or a local replica set before starting the API",
      );
    }
    console.log(`Mongo Connected: ${conn.connection.host} (replica set: ${topology.setName})`)
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
