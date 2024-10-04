import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateUserSettings, updateUserPassword } from './updateData';
import { bookTour } from './stripe';
//Constant
const SUBMIT = 'submit';

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const userUpdateForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

//DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener(SUBMIT, e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

if (userUpdateForm) {
  userUpdateForm.addEventListener(SUBMIT, e => {
    e.preventDefault();

    //create multipart form data
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateUserSettings(form);
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener(SUBMIT, async e => {
    e.preventDefault();

    //animation
    const savePwBtn = document.getElementById('btn-save-password');
    savePwBtn.textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateUserPassword(passwordCurrent, password, passwordConfirm);

    //clear the inputs
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
    savePwBtn.textContent = 'Save password';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    // const tourId = e.target.dataset.tourId;
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
