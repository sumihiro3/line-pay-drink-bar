# line-pay-drink-bar

## install dependencies

```bash
yarn add line-pay uuid consola
```

## linting

```bash
yarn add -D eslint-loader
```

edit the lint script of your package.json:

```json
"lint-fix": "eslint --fix --ext .js,.vue --ignore-path .gitignore ."
```

run eslint auto
ホットリロードモードで ESLint を有効にする

```js
extend(config, ctx) {
    // Run ESLint on save
    if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
            enforce: 'pre',
            test: /\.(js|vue)$/,
            loader: 'eslint-loader',
            exclude: /(node_modules)/
        })
    }
}
```

## add pug and stylus

install loader packages to dev

```bash
yarn add -D pug pug-plain-loader stylus stylus-loader
```

and change template and style codes

