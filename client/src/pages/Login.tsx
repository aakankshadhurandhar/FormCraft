import React from 'react';
import { Button } from "../components/ui/button"
interface LoginProps {
  // Define the props for the component here
}

const Login: React.FC<LoginProps> = () => {
  // Implement the component logic here

  return (
    <div>
      <h1>login</h1>
      {/* Add your form fields and submit button here */}
      <Button >Click me</Button>
    </div>
  );
};

export default Login;
