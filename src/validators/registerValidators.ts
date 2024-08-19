import { checkSchema } from "express-validator";

export default checkSchema({
  email: {
    errorMessage: "Email is requried!",
    notEmpty: true,
  },
});

// export default [body("email").notEmpty().withMessage("Email is requried!")]
