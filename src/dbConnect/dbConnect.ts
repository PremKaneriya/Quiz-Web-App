import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;

        if (uri) {
            await mongoose.connect(uri);
            console.log("Connected to DataBase");

            const connection = mongoose.connection;
            connection.on("connected", () => {
                console.log("DataBase connected");
            });

            connection.on("error", (error) => {
                console.log("DataBase connection error", error);
            });

            return connection; // Return the connection object
        } else {
            throw new Error("No DataBase URI provided");
        }

    } catch (error) {
        console.log("Error connecting to DataBase", error);
        throw error; // Re-throw the error for handling at the calling site
    }
}

export default connectDB;