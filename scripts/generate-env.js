#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const apiBaseUrl = process.env.VITE_API_BASE_URL || 'https://inove-production.up.railway.app/api/inove';
const recaptchaSiteKey = process.env.VITE_RECAPTCHA_SITE_KEY || '';

const isValidRecaptchaKey = recaptchaSiteKey && recaptchaSiteKey.length > 0;


const envFileContent = `// Este arquivo é gerado automaticamente pelo script generate-env.js durante o build
// As variáveis de ambiente do Vercel são injetadas aqui
export const environment = {
  production: true,
  apiBaseUrl: '${apiBaseUrl}',
  recaptchaSiteKey: '${recaptchaSiteKey}',
  enableRecaptcha: ${isValidRecaptchaKey}
};
`;

const envFilePath = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

fs.writeFileSync(envFilePath, envFileContent, 'utf8');

console.log('✅ Arquivo environment.prod.ts gerado com sucesso!');
console.log(`   API Base URL: ${apiBaseUrl}`);
console.log(`   reCAPTCHA Site Key: ${isValidRecaptchaKey ? '***configurado***' : '(não configurado)'}`);
console.log(`   Enable reCAPTCHA: ${isValidRecaptchaKey}`);

if (!isValidRecaptchaKey) {
  console.warn('⚠️  AVISO: VITE_RECAPTCHA_SITE_KEY não está configurada. O reCAPTCHA v3 estará desabilitado.');
}
