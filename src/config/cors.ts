import { CorsOptions } from "cors";

export const corsConfig: CorsOptions = {
  origin: function (origin, callback) {
    const whitelist = [process.env.FRONTEND_URL];
    // Comprobamos si estamos en --api, nos sirve para cuando desarrollamos no tengamos error de cors
    if (process.argv[2] === "--api") {
      whitelist.push(undefined);
    }
    // Si incluye la url de whitelist, permitimos la conexion
    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Error de CORS"));
    }
  },
};
