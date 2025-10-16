#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const apiBaseUrl = process.env.VITE_API_BASE_URL || 'https://inove-production.up.railway.app/api/inove';
const recaptchaSiteKey = process.env.VITE_RECAPTCHA_SITE_KEY || '';

const envFileContent = `export const environment = {
  production: true,
  apiBaseUrl: '${apiBaseUrl}',
  recaptchaSiteKey: '${recaptchaSiteKey}',
  enableRecaptcha: ${recaptchaSiteKey ? 'true' : 'false'}
};
`;

const envFilePath = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

fs.writeFileSync(envFilePath, envFileContent, 'utf8');

console.log('✅ Arquivo environment.prod.ts gerado com sucesso!');
console.log(`   API Base URL: ${apiBaseUrl}`);
console.log(`   reCAPTCHA Site Key: ${recaptchaSiteKey ? '***configurado***' : '(não configurado)'}`);
console.log(`   Enable reCAPTCHA: ${recaptchaSiteKey ? 'true' : 'false'}`);

