import mongoose, { Schema, Model } from "mongoose";
import bcrypt from "bcrypt";
import type { IUser } from "../types/user";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dcptklsco/image/upload/v1768409944/man-avatar_fivw5r.jpg",
    },
    role: {
      type: String,
      enum: ["user", "admin", "deliveryman"],
      default: "user",
    },
    refreshToken: {
      type: String,
    },
    addresses: [
      {
        street: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        country: {
          type: String,
          required: true,
        },
        postalCode: {
          type: String,
          required: true,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    cart: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

userSchema.methods.matchPassword = async function (
  this: IUser,
  password: string,
) {
  return await bcrypt.compare(password, this.password);
};

userSchema.pre("save", async function (this: IUser) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

userSchema.pre("save", function (this: IUser) {
  if (this.isModified("addresses")) {
    const defaultAddresses = this.addresses.filter((add) => add.isDefault);

    if (!defaultAddresses) {
      const firstAddress = this.addresses[0];
      if (firstAddress) {
        firstAddress.isDefault = true;
      }
    }
  }
});

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
