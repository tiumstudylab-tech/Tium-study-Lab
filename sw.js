// TIUM 통합 학생 관리 - Service Worker
// 데이터는 항상 최신 서버 값을 써야 하므로 네트워크 우선 전략
const CACHE = 'tium-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Supabase API 요청은 절대 캐시하지 않음 (항상 최신 데이터)
  if (e.request.url.includes('supabase.co')) {
    return;
  }
  // 그 외(HTML, 폰트 등)는 네트워크 우선, 실패 시 캐시
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (e.request.method === 'GET' && res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
