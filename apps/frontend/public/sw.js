self.addEventListener('push', function (event) {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch {}
  const title = data.title || 'Alerte';
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    data,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

