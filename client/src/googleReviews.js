// Google Places reviews, fetched in the browser through the Maps JavaScript
// API. No npm package: Google's official inline bootstrap loader is injected
// from here, on demand, so none of it touches the initial page load.

// Derived from the Maps link Pedro sent. Not yet confirmed against the API:
// once a key exists, check that fetchFields({ fields: ['displayName'] }) reads
// "Special Finishes Home Improvement".
export const PLACE_ID = 'ChIJk0gR5uMP6IkRsc_qKOkMSEk';

// Browser key, restricted by HTTP referrer in Google Cloud, so shipping it in
// the bundle is safe (same reasoning as the Supabase anon key in storage.js).
// Empty until one is created: loadReviews() then rejects and the section shows
// its fallback links. REACT_APP_GOOGLE_MAPS_KEY overrides it.
export const GOOGLE_MAPS_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY || '';

export const WRITE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${PLACE_ID}`;
// Used when there is no googleMapsURI to link to (no key, or the fetch failed).
export const MAPS_FALLBACK_URL = `https://www.google.com/maps/place/?q=place_id:${PLACE_ID}`;

// Google's documented bootstrap snippet, unmodified apart from taking the key
// as an argument. It defines google.maps.importLibrary, which injects the real
// script the first time a library is requested. It warns if called twice, so
// callers go through loadReviews(), which guards that.
// eslint-disable-next-line new-parens
const bootstrap = (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))});

let bootstrapped = false;

// Resolves to plain data: { rating, ratingCount, mapsUrl, reviews[] }.
// Rejects if there is no key, the script fails to load, or the API errors.
export async function loadReviews() {
    if (!GOOGLE_MAPS_KEY) throw new Error('No Google Maps API key configured');

    if (!bootstrapped) {
        bootstrapped = true;
        bootstrap({ key: GOOGLE_MAPS_KEY, v: 'weekly' });
    }

    const { Place } = await window.google.maps.importLibrary('places');
    const place = new Place({ id: PLACE_ID });
    await place.fetchFields({
        fields: ['rating', 'userRatingCount', 'reviews', 'googleMapsURI'],
    });

    return {
        rating: place.rating,
        ratingCount: place.userRatingCount,
        mapsUrl: place.googleMapsURI,
        // Passed through as Google returns them: no filtering, no editing.
        reviews: (place.reviews || []).slice(0, 5).map((r) => ({
            rating: r.rating,
            text: r.text,
            author: r.authorAttribution?.displayName,
            authorUrl: r.authorAttribution?.uri,
            when: r.relativePublishTimeDescription,
        })),
    };
}
