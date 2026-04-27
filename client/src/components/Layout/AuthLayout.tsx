import { Component, JSX } from 'solid-js';
import { A } from '@solidjs/router';
import './AuthLayout.scss';

interface AuthLayoutProps {
  children?: JSX.Element;
}

const AuthLayout: Component<AuthLayoutProps> = (props) => {
  return (
    <div class="auth-layout">
      <div class="auth-background">
        <div class="bg-gradient"></div>
        <div class="bg-pattern"></div>
      </div>
      
      <div class="auth-container">
        <div class="auth-header">
          <h1 class="auth-logo">Hikarune</h1>
          <p class="auth-tagline">Connect with friends and communities</p>
        </div>
        
        <div class="auth-content">
          {props.children}
        </div>
        
        <div class="auth-footer">
          <p>Already have an account? <A href="/login">Login</A></p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;