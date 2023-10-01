// routes/apiRoutes.js
const express = require('express');
const router = express.Router();
const Models = require('../models');

// Create Form
router.post('/forms', async (req, res) => {
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
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Read Form
router.get('/forms/:id', async (req, res) => {
  try {
    const formId = req.params.id;
    const form = await Models.FormPage.findById(formId);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    res.status(200).json(form);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Submit Form Response
router.post('/forms/:formId/responses', async (req, res) => {
  try {
    const formId = req.params.formId;
    const { response } = req.body;

    const form = await Models.FormPage.findById(formId);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    const formResponse = new Models.FormResponse({
      form: formId,
      response: response, 
    });

    // Save the form response
    const savedResponse = await formResponse.save();

    res.status(201).json(savedResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});



module.exports = router;
