import { checkSchema } from "express-validator";

export default checkSchema({
  name: {
    errorMessage: "Name is required!",
    notEmpty: {
      errorMessage: "Name cannot be empty",
    },
    isLength: {
      options: { min: 8, max: 100 },
      errorMessage: "Name must be between 8 and 100 characters",
    },
  },
  address: {
    errorMessage: "Address is required!",
    notEmpty: {
      errorMessage: "Address is required!",
    },
    isLength: {
      options: { min: 8, max: 255 },
      errorMessage: "Address must be between 8 and 255 characters",
    },
  },
});
