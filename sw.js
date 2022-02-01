const staticCacheVersion = 'billCache-v1';
const cacheArr = [
    '/',
    'assets/style.css',
    'assets/app.js',
    'https://fonts.googleapis.com/css2?family=Montserrat&display=swap',
    'assets/images/friendsa.jpg',
    'assets/images/backpic.png',
    'assets/images/lastpic.png',
    'sw-register.js'
]
// adding cache
self.addEventListener('install',event=>{
    event.waitUntil(
    caches.open(staticCacheVersion)
    .then(cache=>{ 
        cache.addAll(cacheArr)
    })
    )
})
//deleting cache
self.addEventListener('activate',event=>{
    console.log('activate',event)
    event.waitUntil(
        caches.keys()
        .then(
            cacheItem =>{
               return Promise.all(
                   cacheItem.map(item=>{
                       if (item !== staticCacheVersion) {
                           return caches.delete(item);
                       }
                   })
               )    
            }
        )
    )
})
// fetching files
self.addEventListener('fetch',event=>{
    event.respondWith(
        caches.match(event.request)
        .then(cachedRes => {
            const fetchReq = fetch(event.request)
                .then(fetchRes =>{
                caches.open(staticCacheVersion)
                .then(cache=>{
                    cache.put(event.request,fetchRes.clone())
                    return fetchRes;
                }); 
            });
            return cachedRes || fetchReq;
        })
    );
})