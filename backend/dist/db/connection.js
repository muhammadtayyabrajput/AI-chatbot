import { connect, disconnect } from "mongoose";
async function connectToDatabase() {
    try {
        await connect(process.env.MONGODB_URL);
    }
    catch (error) {
        console.log(error);
        throw new Error("Can't connect to the database");
    }
}
async function disconnectToDatabase() {
    try {
        await disconnect();
    }
    catch (error) {
        console.log(error);
        throw new Error("Can't Disconnect from the database");
    }
}
export { connectToDatabase, disconnectToDatabase };
//# sourceMappingURL=connection.js.map