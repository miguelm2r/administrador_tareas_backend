import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

// Añadimos al request el user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Middleware para comprobar si has iniciado sesión
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //console.log(req.headers.authorization);
  // Obtenemos el token de autorizacion
  const bearer = req.headers.authorization;
  if (!bearer) {
    const error = new Error("No autorizado");
    res.status(401).json({ error: error.message });
    return;
  }
  const token = bearer.split(" ")[1];
  //console.log(token);
  // Verificar token
  try {
    // Descodificamos el JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //console.log(decode);
    // Verificar usuario
    if (typeof decoded === "object" && decoded.id) {
      const user = await User.findById(decoded.id).select("_id name email");
      //console.log(user);
      if (user) {
        // Escribimos en el request para enviar la info
        req.user = user;
      } else {
        res.status(500).json({ error: "Token no válido" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Token no válido" });
  }
  next();
};
