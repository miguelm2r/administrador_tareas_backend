import jwt from "jsonwebtoken";
import { Types } from "mongoose";

type UserPayload = {
  id: Types.ObjectId;
};

export const generateJWT = (payload: UserPayload) => {
  // Creamos un token con un payload, una palabra secreta y cuando va a expirar
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "180d",
  });

  return token;
};
