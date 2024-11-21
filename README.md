## Docusaurus

### Automation

All action automated using [just](https://github.com/casey/just) command runner, but ofc you can manage all of this using regular docker commands provided in [justfile](justfile) - so called QoL feature.

```
Available recipes:
    build service="" *args=""   # Rebuild service (usage: just build [prod|dev] [--no-cache])
    clean service=""            # Remove service containers and volumes (usage: just clean [prod|dev])
    default                     # List available commands
    dev                         # Start development environment
    down service=""             # Stop service (usage: just down [prod|dev])
    get-service-name service="" # Get service name
    logs service=""             # View logs (usage: just logs [prod|dev])
    prod                        # Start production environment
    rebuild service="" *args="" # Rebuild and restart service (usage: just rebuild [prod|dev] [--no-cache])
    restart service=""          # Restart service (usage: just restart [prod|dev])
    up service=""               # Start service (usage: just up [prod|dev])
```

In case you not specify prod or dev service - command will run for whole compose instead.

### File mounts

As you can see - I've rewrited a lot of configs and mount all of them inside the contianer. To get template data you should build image and use this commands after (_you can just use first command to get all inside currently working folder - simply replace second path by dot_)

```shell
CID=$(docker create docusaurus:3.6.1) && docker cp $CID:/opt/docusaurus /opt/docusaurus/docusaurus_template_3.6.1 && docker rm $CID
ln -sr /opt/docusaurus/docusaurus_template_3.6.1 /docker/docusaurus/_stash/template
```

Here you can find default configs for your **files** folder to start from.

```
 .gitignore
 blog
 docs
 docusaurus.config.ts
 merge.js
 node_modules
 override.json
 package-lock.json
 package.json
 README.md
 sidebars.ts
󱧼 src
 static
 tsconfig.json
```

### Summary

My example also contains some modifications which you can use as example or just remove them. More info about this repo you can read [here](https://garden.saintvegas.cc/services/docusaurus/docusaurus-docker) =) 