# TypeScript Next.js XBT order book

1. What would you add to your solution if you had more time?
   - Better grouping
   - better tests (websocket mocking)
   - Asset taken from slug
   - Better design
   - better non-blocking ui and memory clean up

> My main problem was learning what a orderbook was

---

2. What would you have done differently if you knew this page was going to get thousands of views
   per second vs per week?

I have prepared the SSR for render a static page each 2 seconds, if more people is comming we should short it.

Also I would throttle the updates, because it is too fast to be useful for users and causes blocking on UI

---

3. What was the most useful feature that was added to the latest version of your chosen language?
   Please include a snippet of code that shows how you've used it.

### TS/JS

- reduce
- modules
- web components
- Map
- flatMap
- array.sort
- `padStart` / `padEnd`

```ts
keyof typeof CONSTANT
```

---

4. How would you track down a performance issue in production? Have you ever had to do this?

I have check performance this ways:

- Checking memmory heap and load time to first iteraction using `puppeteer`
- I have done stress tests of UI component using `storybook` [Component Story Format (CSF)](https://storybook.js.org/docs/react/api/csf) in unit tests and using [storybook-addon-performance](https://storybook.js.org/addons/storybook-addon-performance/)
- registering all of the results in each version to check in `graphana` how is the performance going
- Analizing the js bundles
- Spliting code bundles to lazy load better and more cache for the end user
- responsive and lazy images
