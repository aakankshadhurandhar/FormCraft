import React from 'react';
import DynamicForm from '@/components/DynamicForm';

interface LoginProps {
  // Define the props for the component here
}

const formSchema = {
  owner: '6565e24b66bdad35df7a3004',
  sharedWith: [],
  title: 'SuperForm',
  description: 'Includes all types of inputs',
  published: true,
  inputs: [
    {
      min: 3,
      max: 100,
      label: 'Full Name',
      required: true,
      description: 'Enter your full name',
      type: 'small',
    },
    {
      min: 18,
      max: 100,
      label: 'Age',
      required: true,
      description: 'Enter your Age',
      type: 'number',
    },
    {
      min: 0,
      max: 100,
      label: 'Email Address',
      required: false,
      type: 'email',
    },
    {
      min: 10,
      max: 100,
      label: 'About_me',
      required: true,
      description: 'Tell us about yourself',
      type: 'long',
    },
    {
      options: [
        {
          label: 'Machine Learning',
          value: 'ML',
        },
        {
          label: 'Backend',
          value: 'BACKEND',
        },
        {
          label: 'Frontend',
          value: 'FRONTEND',
        },
        {
          label: 'Android',
          value: 'ANDROID',
        },
      ],
      label: 'Preference',
      description: 'Select your preference',
      required: true,
      type: 'multi',
    },
    {
      options: [
        {
          label: 'Male',
          value: 'M',
        },
        {
          label: 'Female',
          value: 'F',
        },
        {
          label: 'Prefer not to disclose',
          value: 'NA',
        },
      ],
      label: 'Gender',
      required: false,
      type: 'radio',
    },
    {
      min: '2000-07-12',
      max: '2030-01-01',
      label: 'Date picker',
      required: false,
      type: 'date',
    },
    {
      min: '09:30',
      max: '20:00',
      label: 'Time Picker',
      required: false,
      type: 'time',
    },
    {
      label: 'No Input Label',
      description: 'This is a sample description', 
      required: false,
      type: 'none',
    },
  ],
  _id: '6569be5d69ad31fed404741d',
  createdAt: '2023-12-01T11:07:09.392Z',
  updatedAt: '2023-12-01T11:07:09.392Z',
  __v: 0,
};

const Login: React.FC<LoginProps> = () => {
  // Implement the component logic here
  console.log("Login");
  return (
    <div>
      <h1>login</h1>
      <DynamicForm formSchema={formSchema}></DynamicForm>
    </div>
  );
};

export default Login;
