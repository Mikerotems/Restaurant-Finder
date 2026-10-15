# Restaurant-Finder
A website for finding restaurants in close proximity and healthy food requirements.

## Mapbox setup

The search form uses the existing restaurant API to find restaurants. Mapbox
displays those results on the map; it does not provide the restaurant search.
The same search term is also sent to Edamam's Recipe Search API v2 and matching
recipes appear above the restaurant results.

To enable the map, create a Mapbox public access token and put it in the
`mapbox-access-token` meta tag in `index.html`. This token is visible in the
browser, so use a public token restricted to your deployed website's URL in
your Mapbox account. Run or deploy the site over HTTPS so browser location
access is available.

## Restaurant JSON data

Restaurant searches consume the service's `businesses` JSON array. Each result
is normalized into a 13-field restaurant record: `id`, `name`, `image_url`,
`url`, `review_count`, `rating`, `categories`, `price`, `distance`,
`is_closed`, `coordinates`, `location`, and `phone`. The UI builds result cards
and map markers from these records, displaying the available rating, review
count, cuisine categories, price, distance, open status, address, and phone.
Optional fields are omitted from the display when the service does not provide
them.

## Edamam setup

Recipe and restaurant requests use the small Express service on Render. It
keeps the Edamam app key server-side and proxies restaurant searches to avoid
the upstream API's restrictive CORS policy. Deploy `render.yaml` as a Render
Blueprint and enter the app ID and app key for an active Recipe Search API v2
application as the prompted secret environment variables. The proxy rate
limits recipe requests and only permits browser requests from configured
origins.

After Render deploys the service, copy its HTTPS service URL into the
`recipe-api-url` meta tag in `index.html` and deploy the site. For local
testing, run `npm start` with `EDAMAM_APP_ID`, `EDAMAM_APP_KEY`, and
`ALLOWED_ORIGINS` set in the environment, then put the local server URL
(`http://localhost:3000`) in that meta tag. Never put the Edamam app key in
the page or commit it to the repository.
