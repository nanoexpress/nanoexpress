# Docker

If you using `alpine` or `slim` version of `node` images, some errors may happen and you can fix with this minimal guide

## Requires

- git

### For `git` missing error

```Dockerfile
# FROM ...
RUN apk update && apk add --no-cache git
# your scripts
```

### For `Alpine` incompatible error

```Dockerfile
# your scripts
RUN ln -s /lib/libc.musl-x86_64.so.1 /lib/ld-linux-x86-64.so.2

# your commands
# CMD ["node", "server.js"]
```

[&laquo; TypeScript](./typescript.md)

[Benchmark &raquo;](./benchmark.md)
