import yup from "yup";

export const userSchema = yup.object({
  username: yup
    .string()
    .trim()
    .min(3, "Username must be at atlest 3 characters")
    .required(),
  email: yup.string().trim().email("Email is not valid").required(),
  password: yup
    .string()
    .min(4, "Password must be at atlest 4 characters")
    .required(),
});

export const validatorUser = (schema) => async (req, res, next) => {
  try {
    await schema.validate(req.body);
    next();
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
