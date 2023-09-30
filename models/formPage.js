const mongoose = require("mongoose");

// Define the Mongoose schema for FormPage
const formPageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    show: {
      type: Boolean,
      required: true,
    },
    title: String,
    paragraph: String,
    buttonText: String,
    buttons: [
      {
        id: {
          type: String,
          required: true,
        },
        url: String,
        action: String,
        text: String,
        bgColor: String,
        color: String,
      },
    ],
    input: {
      id: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
      placeholder: String,
      label: String,
    },
  },
  {
    timestamps: true,
  }
);
// add plugin that converts mongoose to json
formPageSchema.plugin(toJSON);
// Create and export the Mongoose model for FormPage
const FormPage = mongoose.model("FormPage", formPageSchema);

module.exports = FormPage;
