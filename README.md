# Neufund commitment page

[![Greenkeeper badge](https://badges.greenkeeper.io/Neufund/commit.neufund.org.svg)](https://greenkeeper.io/)

## Developing

```
yarn
yarn start
```
Then open `http://localhost:8080`. Hot reloading of both react and static files (ejs, sass) files should work. Sometimes gulp forgets to watch new files so you need to rerun `yarn start`.

### Linting

To autofix any errors just do `yarn lint:fix`.

### Tests

`yarn test`

#### Coverage report

`yarn test:coverage`

## Building
```
yarn build
```

You will find all files in `dist` directory.

Note: This is not yet production ready build.
