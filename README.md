Bulldozer
=========
[![Dependency Status](https://david-dm.org/tajo/bulldozer.svg)](https://david-dm.org/tajo/bulldozer)

> Deployment (CI) from Bitbucket or Github (and other) to your server. Simple.

## Features

- supports Bitbucket or Github, public and **private** repos
- it has two parts: deployment server and client
- using **tags**
- downloads **.zip** (much faster than fetching the whole repo)
- it shares one configuration and library for server and client parts
- the **configuration** is `.js` file like gulpfile -> it is **100% programmable**!
- uses [Winston](https://github.com/winstonjs/winston) for logging
- no post-commit hooks settings needed on Bitbucket or Github

## Installation and configuration

### Server part

#### 1. Install bulldozer
```shell
npm install -g bulldozer
```

#### 2. Configuration
Create a configuration file `bulldozer.js` in the project (repository) root. You have to **put this file manually on your server**. It's a good idea to keep it in the project repository. Since it is a javascript file, you can easily `require` and use stuff from your project. You can use 3rd party libraries. **The world is your oyster**.

```javascript
// this is an example configuration file
// place it into the root of your project
// it is used by both sides - server and client

var config = {
  // main server address
  url: 'https://example.org',

  // bulldozer deployment server port (must be different than your app port!)
  port: 8000,

  // secures communication between bulldozer's client & server
  // WARNING: you must use HTTPS to keep this token secure!
  secret: 'YOUR_SECRET',

  // bitbucket or github
  gitUrl: 'github',

  // git repository name
  name: 'steida/este',

  // branch that will be tagged by 'bulldozer tag' (master is default)
  branch: 'master',

  // in case the repository is private
  // HTTPS authentication is used
  auth: {
    username: 'USERNAME',
    password: 'PASSWORD'
  },

  // pre-deployment hook
  // put here everything that should be ran before the
  // replacement of source code from Git repository
  preDeploy: function(utils) {
     // utils.getLogger() gives you Winston utility
    utils.getLogger().info('Pre-deploy started.');
    // good place to run some integration tests
    // if false, the deployment is stopped
    // if true, the deployment continues
    return true;
  },

  // post deployment hook
  // put here everything that should be ran with a new source code
  postDeploy: function(utils) {
    utils.getLogger().info('Post-deploy started.');

    // it runs exec(), logs stdout/stderr and returns promise
    utils.run('npm install')
      .then(function() {
        utils.getLogger().info('Deploy finished.');
        utils.getLogger().info('Starting production server.');
        return utils.run('PORT=80 NODE_ENV=production forever stop src/server');
      })
      // if there was no server running, forever stop fails, so I'm catching it here...
      .fail(function() {return utils.getLogger().info('There was no running instance of production server.'); })
      // start application
      .then(function() {return utils.run('PORT=80 NODE_ENV=production forever start src/server'); })
      .then(function() {
        utils.getLogger().info('Production server started.');

        // this is a good place to do something with the output log
        // e.g. you can send it as an email through service like Mailgun or save it as a file
        utils.getLoggerOutput(); // << THIS RETURNS THE OUTPUT LOG AS A STRING

        // resets the output log, so the next deployment log starts clean
        utils.resetLoggerOutput();
      });
  },

  // on error hook
  // this is a good place to do something with the output log
  // e.g. you can send it as an email through service like Mailgun or save it as a file
  onError: function(utils) {
    utils.getLoggerOutput(); // << THIS RETURNS THE OUTPUT LOG AS A STRING
    utils.resetLoggerOutput();
  }

};

module.exports = config;
```

I really recommend to install and use [forever](https://www.npmjs.com/package/forever) to run your app (it's used in the example).

`npm install -g forever`

#### 3. Run

`bulldozer start`

This way you can see the **real-time output**. Or run it on a background.

`nohup bulldozer start &`

The deployment server is started. There is a simple GET API `deploy/:tag?secret=YOUR_SECRET`. When you call it (with a proper tag and secret) the **deployment starts**.

### Client part

To make your life easier there are some another built-in commands. **These commands must be ran from the project (repository) root**. It expects the same `bulldozer.js` configuration that is used on the server.

#### 1. Install bulldozer on your computer

`npm install -g bulldozer`

Yes, everything is in the same module.

#### 2. Create a special deploy tag

`bulldozer tag`

This creates a tag `rYYYYMMDDHHmmss` for the latest commit and branch that you set in the configuration file (`master` is default).

#### 3. Deploy

`bulldozer deploy`

This finds the **latest deploy tag** (`rYYYYMMDDHHmmss`) and calls the deployment server `/deploy`API. It uses **the secret** from the configuration file.

`bulldozer deploy :tag`

You can **specify the tag**. It can be **any tag**, not just a release tag (`rYYYYMMDDHHmmss`).

Don't forget to `git push --tags` between `bulldozer tag` and `bulldozer deploy`.

## Deployment process

It's quite **simple** and **naive** right now.

1. **Calls** `preDeploy()` hook.
2. **Uses** the tag name.
3. GitHub and Bitbucket provide a `.zip` archive for every tag
4. **Downloads** the archive.
5. **Unpacks** the archive to a **temporary dir**.
6. **Moves files** from the temporary dir to the project root.
7. **Calls** `postDeploy()` hook.
8. If something goes wrong, it **calls** `onError()` hook.

It's up to you to save logs. It's up to you to call `npm install`. It's up to you to send an email with results...

## Hooks and utils

There are **three important hooks** (callback) that you can use through the configuration file. `preDeploy(utils)`, `postDeploy(utils)` and `onError(utils)`. When are they called? Check the `Deployment process` section above.

They all accept and get `utils` argument. That's a set of helper functions coming from the bulldozer.

### utils.getLogger()

This returns the instance of [Winston](https://github.com/winstonjs/winston) (logger utility) which is used by bulldozer. Have fun with it! It's particularly useful for logging, duh.

`utils.getLogger().info('some message')`

`utils.getLogger().error('error message')`

This calls `onError()` hook.

### utils.getLoggerOutput()

Returns all Winston messages as a string. Great for emailing.

### utils.resetLoggerOutput()

Resets the previous string. You should do it at the end of every deployment.

### utils.run(command)

This calls the command as a child process and returns a promise. It uses [child-process-promise](https://www.npmjs.com/package/child-process-promise). The bulldozer is automatically logging `stdout` and `stderr` for you. This is a nice way how you can chain more commands (aka asynchronous child processes). See the example `bulldozer.js`.

## Known limitations

- you need one deployment server instance (with different port) for every project
- stuff can go wrong in `postDeploy()` and that's bad because it can modify the running app; on the other hand, it makes `npm install` really fast

## Future

- `postDeploy()` should not have access to the root directory, but it should also use the temporary dir. There will be probably a new hook `postMove()` that can be used for a server start.
- support for more projects under one deployment server

## Contribution

Please, create issues and pull requests.

```shell
git clone https://github.com/tajo/bulldozer
cd bulldozer
npm install
npm run compile
npm link bulldozer
npm install -g bulldozer
```
- Run `gulp eslint` before every commit to preserve the coding style. Do you know there is a [nice real-time checking integration for your editor](http://eslint.org/docs/user-guide/integrations)? ;-)

## Credits

Vojtech Miksu 2015, [miksu.cz](https://miksu.cz), [@vmiksu](https://twitter.com/vmiksu)
