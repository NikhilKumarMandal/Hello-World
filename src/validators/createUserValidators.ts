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
    trim: true,
    errorMessage: "Role is requried!",
    notEmpty: true,
  },
  password: {
    trim: true,
    notEmpty: true,
    isLength: {
      options: {
        min: 8,
      },
      errorMessage: "Password should be at least 8 chars",
    },
  },
  tenantId: {
    trim: true,
    notEmpty: true,
    errorMessage: "Tenant Is is requried!",
  },
});
