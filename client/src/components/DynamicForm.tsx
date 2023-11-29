import React from 'react';
import { Formik, Form } from 'formik';
import FormInput from './FormInput';
import axios from 'axios';
import * as Yup from 'yup';

const DynamicForm: React.FC<{ formSchema: any }> = ({ formSchema }) => {
  const initialValues: { [key: string]: string } = {};

  formSchema.inputs.forEach((input) => {
    if (input.type === 'none') {
      return;
    }
    initialValues[input.label] = '';
  });



  const createFormData = (values: { [key: string]: string }) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(values)) {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          formData.append(key, item);
        });
      } else if (typeof value === 'object' && value !== null) {
        const subValues = Object.keys(value);
        subValues.forEach((subValue) => {
          formData.append(key, subValue);
        });
      } else {
        formData.append(key, value);
      }
    }
    return formData;
  };

  const onSubmit = async (values: { [key: string]: string }, actions: any) => {
    const formData = createFormData(values);
    console.log('Form data:', values);
  
    try {
      const response = await axios.post(`/api/forms/${formSchema._id}/responses`, formData);
      console.log('Server response:', response.data);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  
    actions.setSubmitting(false);
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {({ isSubmitting }) => (
        <Form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {formSchema.inputs.map((input) => (
            <FormInput key={input.label} input={input} />
          ))}
          <button type="submit" disabled={isSubmitting}>
            Submit
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default DynamicForm;
