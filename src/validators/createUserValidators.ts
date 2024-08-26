import { checkSchema } from "express-validator";

export default checkSchema({
  email: {
    errorMessage: "Email is requried!",
    notEmpty: true,
    trim: true,
  },
  firstName: {
    trim: true,
    errorMessage: "FirstName is requried!",
    notEmpty: true,
  },
  lastName: {
    trim: true,
    errorMessage: "LastName is requried!",
    notEmpty: true,
  },
  role: {
    errorMessage: "Role is required!",
    notEmpty: true,
    trim: true,
  },
});
