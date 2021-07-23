const mongoose = require("mongoose");

const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name."],
      unique: true,
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters."],
    },
    slug: String,
    description: {
      type: String,
      required: [true, "Please add a description."],
      maxlength: [500, "Name cannot be more than 500 characters."],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        "Please use a valid URL with http or https",
      ],
    },
    phone: {
      type: String,
      maxlength: [20, "Phone number cannot be more than 20 characters."],
    },
    email: {
      type: String,
      match: [
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        "Please enter a valid email",
      ],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    // location: {
    //   // GeoJSONPoint
    //   type: {
    //     type: String,
    //     enum: ["Point"],
    //     required: true,
    //   },
    //   coordinates: {
    //     type: [Number],
    //     required: true,
    //     index: "2dsphere",
    //   },
    //   formattedAddress: String,
    //   street: String,
    //   city: String,
    //   state: String,
    //   zipcode: String,
    //   country: String,
    // },
    careers: {
      //Array of Strings
      type: [String],
      required: true,
      enum: [
        "Web Development",
        "Mobile Development",
        "UI/UX",
        "Data Science",
        "Business",
        "Other",
      ],
    },
    averageRating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [10, "Rating must not be more than 10"],
    },
    averageCost: Number,
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bootcamp", BootcampSchema);
