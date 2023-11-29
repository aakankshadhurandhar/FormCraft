import React from 'react';
import { Field, ErrorMessage } from 'formik';

interface InputOption {
  label: string;
  value: string;
}

interface Input {
  label: string;
  type: string;
  options?: InputOption[];
}

const FormInput: React.FC<{ input: Input }> = ({ input }) => {
  const generateField = (input: Input) => {
    switch (input.type) {
      case 'small':
      case 'email':
      case 'date':
      case 'time':
        return <Field type={input.type} id={input.label} name={input.label} />;
      case 'long':
        return <Field as="textarea" id={input.label} name={input.label} />;
      case 'multi':
      case 'radio':
        return input.options?.map(option => (
          <div key={option.value}>
            <label>
              <Field
                type={input.type === 'multi' ? 'checkbox' : 'radio'}
                name={input.label}
                value={option.value}
              />
              {option.label}
            </label>
          </div>
        ));
      case 'none':
        return <div>No input for: {input.label}</div>;
      default:
        return null;
    }
  };

  return (
    <div key={input.label}>
      <label htmlFor={input.label}>{input.label}</label>
      {generateField(input)}
      <ErrorMessage name={input.label} component="div" />
      <hr />
    </div>
  );
};

export default FormInput;