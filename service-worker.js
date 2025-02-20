const CACHE_NAME = 'budget-planner-cache-v1';
const STATIC_FILES = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/firebase-config.js',
    '/favicon.ico', // Add this if you have a favicon
];

// Install event - Cache the essential files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(STATIC_FILES);
            })
            .catch((err) => {
                console.error('Error during service worker install:', err);
            })
    );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - Serve files from cache or fetch from network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // If cached, return it
                if (cachedResponse) {
                    return cachedResponse;
                }
                // Otherwise, fetch from network
                return fetch(event.request)
                    .catch(() => {
                        // Fallback if network fails (for offline mode)
                        return caches.match('/index.html');
                    });
            })
    );
});

// Sync event - Sync data with Firebase or fallback to localStorage
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-budget-data') {
        event.waitUntil(syncBudgetData());
    }
});

// Function to sync budget data with Firebase or fallback to localStorage
async function syncBudgetData() {
    try {
        const savedData = JSON.parse(localStorage.getItem('budgetData'));
        if (savedData) {
            // Try to sync with Firebase if possible
            try {
                // Assuming you have a method to update Firebase
                await updateFirebaseData(savedData);
                console.log('Data synced to Firebase');
            } catch (err) {
                console.error('Failed to sync to Firebase, keeping local data.', err);
            }
        }
    } catch (err) {
        console.error('Error reading data from localStorage:', err);
    }
}

// Fallback to Firebase if available
async function updateFirebaseData(data) {
    // Assuming you have a Firebase Firestore method to update
    const db = firebase.firestore();
    const docRef = db.collection('budget').doc('data');
    await docRef.set(data);
}
