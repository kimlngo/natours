import axios from 'axios';
import { showAlert } from './alert';

export async function updateUserSettings(name, email) {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://localhost:8080/api/v1/users/updateMe',
      data: {
        name,
        email,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Data Updated successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
}
