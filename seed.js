const http = require('http');

const baseURL = 'http://localhost:3000'; // Replace with your API base URL

const registerUsers = async () => {
  try {
    for (let i = 1; i <= 10; i++) {
      const userData = {
        username: `user${i}`,
        email: `user${i}@example.com`,
        password: 'userpassword',
      };

      await fetchRequest(`${baseURL}/register`, 'POST', userData);
      console.log(`User ${i} registered successfully`);
    }
  } catch (error) {
    console.error('Error registering users:', error);
  }
};

const createForm = async (token, userNumber, formNumber) => {
  try {
    const formDetails = {
      title: `Form ${formNumber} by user${userNumber}`,
      description: `Description for Form ${formNumber} by user${userNumber}`,
      inputs: [
        {
          type: 'small',
          label: 'Full Name',
          description: 'Enter your full name',
        },
        {
          type: 'email',
          label: 'Email Address',
        },
        {
          type: 'long',
          label: 'Feedback',
          description: 'Enter your feedback',
        },
        // Add more input objects as needed with different types
      ],
    };

    const response = await fetchRequest(`${baseURL}/forms`, 'POST', formDetails, token);
    const responseData = await response.json();
    // check response code
    if (responseData.statusCode == 200) {
      console.log(`Form ${formNumber} created successfully for user${userNumber}`);
    }else{
      console.log(`Form ${formNumber} not created for user${userNumber}`);
    }
  } catch (error) {
    console.error(`Error creating form ${formNumber} for user${userNumber}:`, error);
  }
};

const loginAndCreateForms = async () => {
  try {
    for (let i = 1; i <= 10; i++) {
      const loginData = {
        loginID: `user${i}@email.com`,
        password: 'userpassword',
      };

      const loginResponse = await fetchRequest(`${baseURL}/login`, 'POST', loginData);
      const tokenData = await loginResponse.json();
      const token = tokenData.token;

      for (let j = 1; j <= 10; j++) {
        await createForm(token, i, j);
      }
    }
  } catch (error) {
    console.error('Error logging in or creating forms:', error);
  }
};

const fetchRequest = async (url, method, data, token = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response;
};

(async () => {
  await registerUsers();
  await loginAndCreateForms();
})();
