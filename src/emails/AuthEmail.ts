import { transporter } from "../config/nodemailer";

interface IEmail {
  email: string;
  name: string;
  token: string;
}

export class AuthEmail {
  // Los metodos estaticos no requieren instanciarse
  static sendConfirmationEmail = async (user: IEmail) => {
    const info = await transporter.sendMail({
      from: "UpTask <admin@uptask.com",
      to: user.email,
      subject: "UpTask - Confirma tu cuenta",
      text: "UpTask - Confirma tu cuenta",
      html: `<p>Hola ${user.name}, has creado una cuenta en UpTask, solo te queda confirmar tu cuenta </p>
      <p>Visita el siguiente enlace: </p>
        <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar Cuenta </a>
        <p>Ingresa el codigo: <b>${user.token}</b></p>
        <p>Este token expira en 10 minutos</p>
      `,
    });

    console.log("Mensaje enviado", info.messageId);
  };

  // Recuperar contraseña
  static sendPasswordResetToken = async (user: IEmail) => {
    const info = await transporter.sendMail({
      from: "UpTask <admin@uptask.com",
      to: user.email,
      subject: "UpTask - Recuperar tu contraseña",
      text: "UpTask - Recuperar tu contraseña",
      html: `<p>Hola ${user.name}, has solicitado recuperar tu contraseña. </p>
      <p>Visita el siguiente enlace: </p>
        <a href="${process.env.FRONTEND_URL}/auth/new-password">Cambiar Contraseña </a>
        <p>Ingresa el codigo: <b>${user.token}</b></p>
        <p>Este token expira en 10 minutos</p>
      `,
    });

    console.log("Mensaje enviado", info.messageId);
  };
}
