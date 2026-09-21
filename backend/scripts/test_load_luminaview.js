import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Montée progressive à 20 utilisateurs
    { duration: '1m',  target: 50 },  // Maintien à 50 utilisateurs
    { duration: '30s', target: 100 }, // Pic de charge à 100 utilisateurs
    { duration: '30s', target: 0 },   // Descente progressive
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% des requêtes doivent répondre en moins de 500ms
    http_req_failed: ['rate<0.01'],    // Moins de 1% d'erreurs
  },
};

export default function () {
  // 1. Appel page d'accueil / manager
  const resHome = http.get('https://luminaview.fr/');
  check(resHome, { 'Home OK (200)': (r) => r.status === 200 });

  // 2. Appel API Backend (adaptez l'URL selon vos routes réelles)
  const resApi = http.get('https://luminaview.fr/api/health');
  check(resApi, { 'API OK (200)': (r) => r.status === 200 });

  sleep(1); // Pause réaliste de 1 seconde entre les actions
}
