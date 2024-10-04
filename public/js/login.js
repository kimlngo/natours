import axios from 'axios';
import { showAlert } from './alert';
export async function login(email, password) {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:8080/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (e) {
    console.log(e);
    // showAlert('error', e.response.data.message);
    showAlert('error', e.response.data.message);
  }
}

export async function logout() {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:8080/api/v1/users/logout',
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged out successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', 'Error logging out! Try again.');
  }
}
