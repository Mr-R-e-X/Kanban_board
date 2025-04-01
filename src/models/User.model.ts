import bcrypt from "bcryptjs";
import { Document, Schema, model, models } from "mongoose";
import jwt from "jsonwebtoken";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  profile_image?: string;
  is_verified: boolean;
  verify_code: string;
  verify_code_expiry: Date;
  forgot_password_token?: string;
  forgot_password_token_expiry?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profile_image: { type: String },
    is_verified: { type: Boolean, default: false },
    verify_code: { type: String },
    verify_code_expiry: { type: Date },
    forgot_password_token_expiry: { type: Date, required: false },
    forgot_password_token: { type: String, required: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateForgotPasswordToken = function () {
  const token = jwt.sign(
    { _id: this._id },
    process.env.JWT_SECRET_FOR_FORGET_PASSWORD_TOKEN!,
    {
      expiresIn: "15m",
    }
  );
};

userSchema.methods.generateAccessToken = async function () {
  const token = jwt.sign(
    { _id: this._id, profile_image: this.profile_image },
    process.env.JWT_SECRET_FOR_ACCESS_TOKEN!,
    {
      expiresIn: "2d",
    }
  );
  return token;
};
export const User = models?.User || model<IUser>("User", userSchema);
