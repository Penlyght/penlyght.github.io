'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/asset/icons/authentication.png": "d2f5a34fe20ea3173d1a8b5c0b9a4831",
"assets/asset/icons/calendar.png": "006eefe2b19676498f4830e61f9115ff",
"assets/asset/icons/control-center.png": "b3efdfd12a31efaa3b76e9f3f575c5fc",
"assets/asset/icons/event.png": "3606ca83f1295d136dd3fba34ebbfd77",
"assets/asset/icons/instagram-logo.png": "fa90e1e7734e5bef1193daca074ad67c",
"assets/asset/icons/instagram_white.png": "ad3465f4f752db1efd5a1a9bf16d15b2",
"assets/asset/icons/job-search.png": "47df9b0a47246dcb4e0e31b2881f26ca",
"assets/asset/icons/job.png": "25da375edb9101176da08236f5d2149a",
"assets/asset/icons/linkedin-logo.png": "e66c441680ba884aa8019ecd0acdd6b3",
"assets/asset/icons/linkedin_logo_dark.png": "1a9291b12d642cb2fa8aa8fbef5c7be1",
"assets/asset/icons/logo.png": "f17b317268708ba61b06c413aa808d12",
"assets/asset/icons/logo1.png": "a4ff2bf9782a679e6ae8a2ea2dad1c4d",
"assets/asset/icons/no-spam.png": "9dee1bb74e97e22dff72da9162794e76",
"assets/asset/icons/parking.png": "15fbe9fc66f71bb2e4e28db2cc044950",
"assets/asset/icons/send.png": "d4c63d45a24d23cb4c6f47ff5a9ee2a6",
"assets/asset/icons/shop.png": "95296b50cbd83fc61dfca4d3a4b7283a",
"assets/asset/icons/social-ad-reach.png": "8a05a8cc1521a829f7c49b13a1475eb4",
"assets/asset/icons/twitter-sign.png": "8544bcc4dc7222716fe13fbb4de32b44",
"assets/asset/icons/twitter_sign_white.png": "8d11d26be1468859bb43792552073108",
"assets/asset/images/events.png": "7db71b7fa04379cdc6489430033c2a3a",
"assets/asset/images/featureDemoImg.png": "d1a029acdf94f59e96dd9b45c4859a7f",
"assets/asset/images/intro-bg.png": "c9890157ebabe037e63c1f93adaa1de6",
"assets/asset/images/introImg.png": "8d96ec991e0195c05347a2a78de74a42",
"assets/asset/images/jobs.png": "801aede8313152339fb34d8451bb26e1",
"assets/asset/images/market.png": "342b719b624072c30be1cafcde0478d2",
"assets/asset/images/myspace.png": "8675cd00fd8500609b64dada26e4413c",
"assets/AssetManifest.json": "226f9cd39c5d877f737734925a93c42f",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/NOTICES": "74e4b4b65d4edeee443121223b102b57",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"favicon.png": "43bf75c27c9ad9bd42c247b2d73bb63f",
"icons/Icon-192.png": "f17b317268708ba61b06c413aa808d12",
"icons/Icon-maskable-192.png": "f17b317268708ba61b06c413aa808d12",
"index.html": "eecdf3e716a8ac274e79c090270a79e1",
"/": "eecdf3e716a8ac274e79c090270a79e1",
"main.dart.js": "f675381d8fa0c85ff158479b6f479c96",
"manifest.json": "a3746703dbe0ea8595758c9d8fb96011",
"version.json": "4718e5c708bada1a1b97213d4db4bb75"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
