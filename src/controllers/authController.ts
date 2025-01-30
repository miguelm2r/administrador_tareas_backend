import type { Request, Response } from "express";
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import Token from "../models/Token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    try {
      //res.send("desde auth");
      const { password, email } = req.body;
      // Prevenir duplicados
      const userExists = await User.findOne({ email });
      if (userExists) {
        const error = new Error("El usuario ya esta registrado");
        res.status(409).json({ error: error.message });
        return;
      }
      const user = new User(req.body);
      // Hashear contraseña
      user.password = await hashPassword(password);

      // Generar token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      // Enviar email
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      // Guardamos
      //await user.save();
      await Promise.allSettled([user.save(), token.save()]);

      res.send("Cuenta creada, revisa tu email para confirmarla");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      //console.log(token);
      const tokenExists = await Token.findOne({ token });
      //console.log(tokenExists);
      if (!tokenExists) {
        const error = new Error("Token no valido");
        res.status(401).json({ error: error.message });
        return;
      }
      const user = await User.findById(tokenExists.user);
      //console.log(user);
      user.confirmed = true;
      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);
      res.send("Cuenta confirmada correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("El usuario no existe");
        res.status(401).json({ error: error.message });
        return;
      }

      if (!user.confirmed) {
        // Creamos un nuevo token para reenviarle un email
        const token = new Token();
        token.user = user.id;
        token.token = generateToken();
        await token.save();
        // Enviar email
        AuthEmail.sendConfirmationEmail({
          email: user.email,
          name: user.name,
          token: token.token,
        });

        const error = new Error(
          "Cuenta no confirmada. Te hemos enviado un nuevo token a tu correo."
        );
        res.status(401).json({ error: error.message });
        return;
      }
      // Comprobamos la contraseña
      const isPasswordCorrect = await checkPassword(password, user.password);
      if (!isPasswordCorrect) {
        const error = new Error("Contraseña incorrecta");
        res.status(401).json({ error: error.message });
        return;
      }

      // Generamos un JWT de sesión
      const token = generateJWT({ id: user.id });
      res.send(token);
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static requestConfirmationToken = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      // Usuario existe
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("El usuario no existe");
        res.status(404).json({ error: error.message });
        return;
      }

      if (user.confirmed) {
        const error = new Error("El usuario ya esta confirmado");
        res.status(403).json({ error: error.message });
        return;
      }

      // Generar token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      // Enviar email
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      // Guardamos
      //await user.save();
      await Promise.allSettled([user.save(), token.save()]);

      res.send("Token enviado a tu correo");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      // Usuario existe
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("El usuario no existe");
        res.status(404).json({ error: error.message });
        return;
      }

      // Generar token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      // Enviar email
      AuthEmail.sendPasswordResetToken({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      // Guardamos token
      await token.save();

      res.send("Token enviado a tu correo");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static validateToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error("Token no valido");
        res.status(401).json({ error: error.message });
        return;
      }
      res.send("Token válido");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static updatePasswordWithToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error("Token no valido");
        res.status(401).json({ error: error.message });
        return;
      }
      const user = await User.findById(tokenExists.user);
      user.password = await hashPassword(req.body.password);

      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);

      res.send("La contraseña se modifico correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static user = async (req: Request, res: Response) => {
    res.json(req.user);
    return;
  };

  static updateProfile = async (req: Request, res: Response) => {
    const { name, email } = req.body;

    const userExists = await User.findOne({ email });
    // Comprobar si el usuario existe y es diferente al usuario actual
    if (userExists && userExists.id.toString() !== req.user.id.toString()) {
      const error = new Error("El email ya esta registrado");
      res.status(409).json({ error: error.message });
      return;
    }

    req.user.name = name;
    req.user.email = email;

    try {
      await req.user.save();
      res.send("Perfil actualizado correctamente");
    } catch (error) {
      res.status(500).send("Hubo un error");
    }
  };

  static updateCurrentUserPassword = async (req: Request, res: Response) => {
    const { current_password, password } = req.body;

    const user = await User.findById(req.user.id);

    const isPasswordCorrect = await checkPassword(
      current_password,
      user.password
    );

    if (!isPasswordCorrect) {
      const error = new Error("La contraseña es incorrecta");
      res.status(401).json({ error: error.message });
      return;
    }

    try {
      user.password = await hashPassword(password);
      await user.save();
      res.send("La contraseña se modifico correctamente");
    } catch (error) {
      res.status(500).send("Hubo un error");
    }
  };

  static checkPassword = async (req: Request, res: Response) => {
    const { password } = req.body;

    const user = await User.findById(req.user.id);

    const isPasswordCorrect = await checkPassword(password, user.password);

    if (!isPasswordCorrect) {
      const error = new Error("La contraseña es incorrecta");
      res.status(401).json({ error: error.message });
      return;
    }

    res.send("Contraseña correcta");
  };
}
