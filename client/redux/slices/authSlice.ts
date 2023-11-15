/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { LoginParams, LoginResponse } from '../../types/user/userTypes';
// @ts-expect-error ignore
import actionFactory from '../../utils/libs/actionFactory';

export const login = createAsyncThunk<LoginResponse, LoginParams>(
  'auth/login',
  async (params, { dispatch }) => {
    return new Promise<LoginResponse>(() => {
      actionFactory<LoginResponse>({
        api: 'post/api/login',
        excludeHeader: true,
        actionBase: 'LOGIN',
        actionBody: {
          body: params,
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        callback: (
          respPromise: Promise<{ data: any }>,
          dispatch: any,
          getState: any,
        ) => {
          // Handle the login response
          respPromise
            .then((resp: { data: LoginResponse }) => {
              console.log(resp.data);
            })
            .catch(() => {});
        },
      })(dispatch);
    });
  },
);
