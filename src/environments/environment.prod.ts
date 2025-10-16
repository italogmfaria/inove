import { getEnvVar } from './env-helper';

export const environment = {
  production: true,
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'https://inove-production.up.railway.app/api/inove'),
  recaptchaSiteKey: getEnvVar('VITE_RECAPTCHA_SITE_KEY', ''),
  enableRecaptcha: true
};
