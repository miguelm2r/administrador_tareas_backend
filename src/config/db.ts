import mongoose from "mongoose";
import colors from "colors";

// Nos conectamos a la base de datos
export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.DATABASE_URL);
    const url = `${connection.connection.host}:${connection.connection.port}`;
    console.log(colors.magenta.bold(`MongoDB conectado en: ${url}`));
  } catch (error) {
    console.log(colors.red.bold("Error al conectar a la base de datos"));
    process.exit(1);
  }
};
