import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post(
  "/create-account",
  //res.send("desde auth");
  body("name").notEmpty().withMessage("El nombre no puede ir vacio"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña no puede ser menor a 8 caracteres"),
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("La contraseña deben coincidir");
    }
    return true;
  }),
  body("email").isEmail().withMessage("El email debe ser válido"),
  handleInputErrors,
  AuthController.createAccount
);

router.post(
  "/confirm-account",
  body("token").notEmpty().withMessage("El token no puede ir vacio"),
  handleInputErrors,
  AuthController.confirmAccount
);

router.post(
  "/login",
  body("email").isEmail().withMessage("El email debe ser válido"),
  body("password").notEmpty().withMessage("La contraseña no es válida"),
  handleInputErrors,
  AuthController.login
);

router.post(
  "/request-code",
  body("email").isEmail().withMessage("El email debe ser válido"),
  handleInputErrors,
  AuthController.requestConfirmationToken
);

router.post(
  "/forgot-password",
  body("email").isEmail().withMessage("El email debe ser válido"),
  handleInputErrors,
  AuthController.forgotPassword
);

router.post(
  "/validate-token",
  body("token").notEmpty().withMessage("El token no puede ir vacio"),
  handleInputErrors,
  AuthController.validateToken
);

router.post(
  "/update-password/:token",
  param("token").isNumeric().withMessage("Token no válido"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña no puede ser menor a 8 caracteres"),
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("La contraseña deben coincidir");
    }
    return true;
  }),
  handleInputErrors,
  AuthController.updatePasswordWithToken
);

router.get("/user", authenticate, AuthController.user);

/** Profile */
// Actualizar perfil
router.put(
  "/profile",
  authenticate,
  body("name").notEmpty().withMessage("El nombre no puede ir vacio"),
  body("email").isEmail().withMessage("El email debe ser válido"),
  handleInputErrors,
  AuthController.updateProfile
);

// Cambiar contraseña
router.post(
  "/update-password",
  authenticate,
  body("current_password")
    .notEmpty()
    .withMessage("La contraseña actual no puede ir vacia"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña no puede ser menor a 8 caracteres"),
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("La contraseña deben coincidir");
    }
    return true;
  }),
  handleInputErrors,
  AuthController.updateCurrentUserPassword
);

// Comprobar contraseña
router.post(
  "/check-password",
  authenticate,
  body("password")
    .notEmpty()
    .withMessage("La contraseña actual no puede ir vacia"),
  handleInputErrors,
  AuthController.checkPassword
);

export default router;
