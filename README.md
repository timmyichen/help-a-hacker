# Help-A-Hacker

This is the repo for the client & server of [help-a-hacker.net](https://help-a-hacker.net). Feel free to contribute; we're always looking for improvements.

The stack used is Nuxt.js and Vue.js on the client, and Express on the server. All in TypeScript.

## Requirements

You must have docker installed on your local machine and know some basic git-fu.

## Setup

Clone the repo onto your local computer:

```
git clone https://github.com/timmyichen/help-a-hacker
```

Install the packages

```
npm install
```

Build and start the server:

```
docker-compose up
```

In a new terminal process, run the following:

```
docker exec -it mongo0 mongo
```

This will be up the mongo shell. Then type in the following to configure the replica set:

```
config={"_id":"rs0","members":[{"_id":0,"host":"mongo0:27017"},{"_id":1,"host":"mongo1:27017"},{"_id":2,"host":"mongo2:27017"}]}
```

```
rs.initiate(config)
```

You should see something that has `"ok" : 1` as the first line.

Restart the server by saving any of the `.ts` files in the `server/` directory.
Later on, you may have to do this when first running `docker-compose` up after a few
seconds as the mongodb replica set may need some time to elect a leader (and the
connection will fail as its trying to do so).
