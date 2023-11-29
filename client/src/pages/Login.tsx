import React from 'react';
import DynamicForm from '../components/DynamicForm';

interface LoginProps {
  // Define the props for the component here
}

const formSchema = {
        "owner": "6565e24b66bdad35df7a3004",
        "sharedWith": [],
        "title": "SuperForm",
        "description": "Includes all types of inputs",
        "published": true,
        "inputs": [
            {
                "min": 0,
                "max": 100,
                "label": "Full Name",
                "required": false,
                "description": "Enter your full name",
                "type": "small"
            },
            {
                "min": 0,
                "max": 100,
                "label": "Email Address",
                "required": false,
                "type": "email"
            },
            {
                "min": 0,
                "max": 100,
                "label": "Feedback",
                "required": false,
                "description": "Enter your feedback",
                "type": "long"
            },
            {
                "options": [
                    {
                        "label": "Machine Learning",
                        "value": "ML"
                    },
                    {
                        "label": "Backend",
                        "value": "BACKEND"
                    },
                    {
                        "label": "Frontend",
                        "value": "FRONTEND"
                    },
                    {
                        "label": "Android",
                        "value": "ANDROID"
                    }
                ],
                "label": "Preference",
                "required": false,
                "type": "multi"
            },
            {
                "options": [
                    {
                        "label": "Male",
                        "value": "M"
                    },
                    {
                        "label": "Female",
                        "value": "F"
                    },
                    {
                        "label": "Prefer not to disclose",
                        "value": "NA"
                    }
                ],
                "label": "Gender",
                "required": false,
                "type": "radio"
            },
            {
                "label": "Date picker",
                "required": false,
                "type": "date"
            },
            {
                "label": "Time Picker",
                "required": false,
                "type": "time"
            },
            {
                "label": "No Input Label",
                "required": false,
                "type": "none"
            }
        ],
        "_id": "656661c8b6f191aca5ac8e67",
        "createdAt": "2023-11-28T21:55:20.408Z",
        "updatedAt": "2023-11-28T21:55:20.408Z",
        "__v": 0
    }



const Login: React.FC<LoginProps> = () => {
  // Implement the component logic here

  return (
    <div>
      <h1>login</h1>
      <DynamicForm formSchema={formSchema} />
    </div>
  );
};

export default Login;

