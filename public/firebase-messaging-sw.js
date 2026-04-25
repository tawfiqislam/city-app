importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyD7V-9XMO_H4wDCMKot1sffa40tA5_66vo",
  authDomain: "citywatch-97fd0.firebaseapp.com",
  projectId: "citywatch-97fd0",
  storageBucket: "citywatch-97fd0.firebasestorage.app",
  messagingSenderId: "450379095961",
  appId: "1:450379095961:web:1b1d0a1fc868defbc1fd08"
});

var messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log("Background message received:", payload);

  var title = payload.notification ? payload.notification.title : "CityWatch Alert";
  var body = payload.notification ? payload.notification.body : "New notification";

  var options = {
    body: body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    vibrate: [200, 100, 200],
    data: { url: "/" },
    actions: [
      { action: "open", title: "Open CityWatch" }
    ]
  };

  return self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || "/")
  );
});