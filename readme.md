# Gera WebGL library.

I first developed my own WebGL library (based on v1.0) back in 2014. Now I’ve decided to revisit those ideas, explore what WebGL 2.0 offers, and rebuild everything from scratch. The project is named in memory of my cat, who died in 2017.

- **API reference (JSDoc):** https://gelovolro.github.io/gerawebgl/
- **Demo:** https://gelovolro.github.io/gerawebgl/demo/

## Build & run demo:
```bash
npm install
npm run build # or npm run build:all
npm run demo:serve
```

## Working with linting:
```bash
# Check:
npx eslint core

# Fixing:
npx eslint core --fix
```

## Docs generation commands:
```bash
npm run docs:build
npm run docs:serve
npm run docs:build-and-serve
```
