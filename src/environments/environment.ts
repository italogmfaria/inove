import { getEnvVar } from './env-helper';

export const environment = {
  production: false,
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:8080/api/inove'),
  recaptchaSiteKey: getEnvVar('VITE_RECAPTCHA_SITE_KEY', ''),
  enableRecaptcha: false
};
