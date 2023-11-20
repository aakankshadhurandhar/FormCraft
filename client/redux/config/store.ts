import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
const store = configureStore({
  // add reducer here
  reducer: {},
});
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export default store;
