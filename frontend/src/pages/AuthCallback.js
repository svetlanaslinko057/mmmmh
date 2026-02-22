import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * AuthCallback - Handles Google OAuth callback
 * Processes session_id from URL fragment and exchanges it for session token
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Get session_id from URL fragment
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.replace('#', ''));
        const sessionId = params.get('session_id');

        if (!sessionId) {
          console.error('No session_id in URL');
          navigate('/login', { replace: true });
          return;
        }

        // Exchange session_id for user data
        const response = await axios.post(
          `${API_URL}/api/v2/auth/google`,
          { session_id: sessionId },
          { withCredentials: true }
        );

        const { user } = response.data;

        // Redirect to home with user data
        navigate('/', { 
          replace: true, 
          state: { user, justLoggedIn: true } 
        });

      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login', { 
          replace: true, 
          state: { error: 'Authentication failed. Please try again.' } 
        });
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
        <p className="text-gray-600 text-xl">Авторизація...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
