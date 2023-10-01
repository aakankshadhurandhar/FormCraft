const Models = require("../models");


module.exports.create = async (req, res) => {
  try {
    const { title, description, inputs } = req.body;

    const form = new Models.FormPage({
      title,
      description,
      inputs,
    });

    const savedForm = await form.save();
    res.status(201).json(savedForm);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}


module.exports.read = async (req, res) => {
  try {
    const formID = req.params.formID;
    const form = await Models.FormPage.findById(formID);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.status(200).json(form);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}