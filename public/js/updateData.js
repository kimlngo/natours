import axios from 'axios';
import { showAlert } from './alert';

//constant
const SUCCESS = 'success';
const ERROR = 'error';
const PATCH = 'PATCH';

export async function updateUserSettings(data) {
  try {
    const res = await axios({
      method: PATCH,
      url: '/api/v1/users/updateMe',
      data,
    });

    if (res.data.status === SUCCESS) {
      showAlert(SUCCESS, 'Data Updated successfully');
    }
  } catch (err) {
    showAlert(ERROR, err.response.data.message);
  }
}

export async function updateUserPassword(
  passwordCurrent,
  password,
  passwordConfirm,
) {
  try {
    const res = await axios({
      method: PATCH,
      url: '/api/v1/users/updateMyPassword',
      data: { passwordCurrent, password, passwordConfirm },
    });

    if (res.data.statsus === SUCCESS)
      showAlert(SUCCESS, 'Password Update Successful!');
  } catch (err) {
    showAlert(ERROR, 'Error logging out! Try again.');
  }
}
