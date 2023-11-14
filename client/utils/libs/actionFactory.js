import axios from "axios";
import { isFunction } from "lodash";

// TODO: add Toast element

const pathExtractor = (request_path, params) => {
  const request_type = request_path.slice(0, request_path.indexOf("/"));
  const psuedo_path = request_path.slice(request_path.indexOf("/") + 1);
  var path = psuedo_path;
  for (const key in params) {
    path = psuedo_path.replaceAll(key, params[key]);
  }
  return { request_type, path };
};

/**
 *
 * @param {object} Object containing the following properties.
 *   @param {string}            api              api path 'get/api/categories'.
 *   @param {string}            actionBase       action type base 'GET_USERS'.
 *   @param {object}            params           params to be passed to the api path.
 *   @param {function}          callback         callback function to be called after the api call is completed.
 *   @param {string}            successToast     Toast message to be displayed on success.
 *   @param {bool || string}    failureToast     Toast message to be displayed on failure.
 * @return  {function}          action creator function to make API call and dispatching the response.
 */

function actionFactory ({
  api,
  actionBase,
  excludeHeader,
  actionBody = {},
  callback = () => {},
  successToast = null,
  failureToast = null,
  initialization = () => {},
}) {
  const REQUEST = `${actionBase}_REQUEST`;
  const SUCCESS = `${actionBase}_SUCCESS`;
  const FAILURE = `${actionBase}_FAILURE`;
  const PARAM_DEBUG = `${actionBase}_REQ_PARAM_DEBUG`;

  return function (dispatch, getState) {
    let p;
    if (isFunction(actionBody)) {
      p = actionBody(getState);
    } else {
      p = { ...actionBody };
    }
    initialization(p, dispatch, getState);
    dispatch({
      type: REQUEST,
      payload: p,
    });
    dispatch({
      type: PARAM_DEBUG,
      payload: {
        obj: p,
        json: JSON.stringify(p),
      },
    });
    const token = localStorage.getItem("token");
    const { request_type, path } = pathExtractor(api, p);
    const headers = {
      "Content-Type": "application/json",
    };
    if ( !excludeHeader) {
      headers.Authorization = `Bearer ${token}`; // Add the Authorization header with the token if it exists and excludeHeader is false
    }
    const respPromise = axios({
      method: request_type,
      url: path,
      data: p.body,
      headers:headers,
      params: p.params,
    });

    respPromise
      .then((resp) => {
        dispatch({
          type: SUCCESS,
          payload: resp.data,
        });

        if (successToast) {
          //TODO: successToast is needed
        }

        return resp.data;
      })
      .catch((err) => {
        dispatch({
          type: FAILURE,
          payload: err.message,
        });

        if (typeof failureToast === "boolean" && failureToast) {
          // TODO: show some failureToast
        }

        if (typeof failureToast === "string") {
          // TODO: show some failureToast
        }

        throw err.message;
      });

    callback(respPromise, dispatch, getState);
  };
}
export default actionFactory;