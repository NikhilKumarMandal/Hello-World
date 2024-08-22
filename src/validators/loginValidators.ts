import { checkSchema } from "express-validator";

export default checkSchema({
  email: {
    errorMessage: "Email is requried!",
    notEmpty: true,
    trim: true,
  },
  password: {
    trim: true,
    notEmpty: true,
    errorMessage: "Password is requried!",
  },
});
