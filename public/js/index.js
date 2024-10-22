/* eslint-disable */

import "@babel/polyfill";
import { login,logout } from './login';
import {updateData,updatePass} from './updateSetting'
// const AppError =require('../../utils/appError'); 
const loginForm = document.querySelector('.form--login');
const logoutbtn = document.querySelector('.nav__el--logout');
const UserData = document.querySelector('.form-user-data');
const passChange = document.querySelector('.form-user-password');
// console.log(2+3);



if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    
    login(email, password);
  });

if(logoutbtn)   logoutbtn.addEventListener('click',logout);

if(UserData){
    UserData.addEventListener('submit',e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    // console.log(form);

    updateData(form);
    })
}

if (passChange) {
    passChange.addEventListener('submit', e => {
      e.preventDefault();
      const saveButton = document.querySelector('.btn--save-password');
      saveButton.textContent = 'Updating...';
  
      const currPass = document.getElementById('password-current').value;
      const newPass = document.getElementById('password').value;
      const conNewPass = document.getElementById('password-confirm').value;
      if (newPass === conNewPass) {
        updatePass(currPass, newPass)
          .then(() => {
            saveButton.textContent = 'Save Password';
          })
          .catch((err) => {
            console.error('Error updating password:', err);
            saveButton.textContent = 'Save Password';
            alert('Error updating password. Please try again.');
          });
      } else {
        alert('Passwords do not match!');
        saveButton.textContent = 'Save Password';  
      }
    });
}