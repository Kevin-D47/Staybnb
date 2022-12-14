// frontend/src/components/LoginForm/index.js
import React, { useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import './LoginForm.css';


function LoginForm({setShowLoginModal}) {
  const dispatch = useDispatch();

  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors([]);
    return dispatch(sessionActions.login({ credential, password }))
      .then(() => setShowLoginModal(false))
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) setErrors(data.errors);
      });
  }

  return (
    <form className='login-form-container' onSubmit={handleSubmit}>
      <div className="login-title-container">
        <h3 id="login-title">Log in</h3>
      </div>
      <div className='welcome-title-container'>
        <h4 id='welcome-title'>Welcome to Staybnb</h4>
      </div>
      <input
        className='login-input'
        id="login-email-input"
        type="text"
        placeholder={'Email / Username'}
        value={credential}
        onChange={(e) => setCredential(e.target.value)}
        required
      />
      <input
        className='login-input'
        id="login-pw-input"
        type="password"
        placeholder={'Password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <div className='login-errors-container'>
        {errors.length > 0 && (
          <ul className="errors-list">
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        )}
      </div>
      <button className="login-button" type="submit" >Continue</button>
      <button className="login-button" type='submit' onClick={() => {
        setCredential('Demo-lition')
        setPassword('password')
      }}>Demo Login</button>
    </form>
  );
}

export default LoginForm;
