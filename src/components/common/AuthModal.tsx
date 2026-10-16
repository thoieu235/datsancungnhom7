import React from 'react';
import { AuthScreen } from '../auth/AuthScreen';

/**
 * Backward compatibility wrapper:
 * User requested to convert login/register from a popup modal into a full-screen dedicated page.
 */
export const AuthModal: React.FC = () => {
  return <AuthScreen />;
};
