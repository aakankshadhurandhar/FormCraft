import { useEffect } from 'react';
import './App.css';
import { useAppDispatch } from '../redux/config/store';
import { login } from '../redux/slices/authSlice';
import { BrowserRouter } from 'react-router-dom';
import { Router } from './Routes';

function App() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(
      login({
        loginID: 'fakeuser147',
        password: 'userpassword',
      }),
    );
  }, [dispatch]);
  return (
    <>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </>
  );
}

export default App;
