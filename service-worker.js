import {precacheAndRoute} from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.CacheFirst()
);

workbox.routing.registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new workbox.strategies.StaleWhileRevalidate()
);

workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.StaleWhileRevalidate()
);

self.addEventListener('push', function(event) {
    // Vérifier si le payload est présent dans l'événement push
    let data = {};
    if (event.data) {
        data = event.data.json();  // Parse le payload JSON envoyé par le serveur
    }

    // Définit les options de la notification
    const title = data.title || 'Nouvelle notification';
    const options = {
        body: data.message || 'Vous avez reçu une notification push.',
        icon: data.icon || '/images/notification-icon.png', // URL d’une icône de notification (facultatif)
        badge: data.badge || '/images/notification-badge.png', // URL d’un badge de notification (facultatif)
        data: {
            url: data.url || '/'  // Lien à ouvrir lors d'un clic
        }
    };

    // Affiche la notification
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force l'activation immédiate du nouveau service worker
});

self.addEventListener('activate', (event) => {
    // Supprime les caches existants pour garantir le rafraîchissement
    caches.keys().then(cacheNames => {
        return Promise.all(
            cacheNames.map(cache => caches.delete(cache))
        );
    });
    return self.clients.claim();
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Fermer la notification lorsqu'elle est cliquée

    // Extraire l'URL de l'action ou d'un champ personnalisé dans le payload
    const urlToOpen = event.notification.data && event.notification.data.url
     'http://localhost:3000/'; // URL par défaut si aucune URL n'est spécifiée

    // Ouvrir une nouvelle fenêtre avec l'URL si elle n'est pas déjà ouverte
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let client of windowClients) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus(); // Focus sur l'onglet si l'URL est déjà ouverte
                }
            }
            // Ouvrir une nouvelle fenêtre si l'URL n'est pas encore ouverte
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
