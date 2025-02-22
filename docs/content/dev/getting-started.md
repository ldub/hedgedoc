# Getting started

To run HedgeDoc 2.0 you need three components: the backend, the frontend and the reverse proxy.

Backend and Frontend are included in the [HedgeDoc repo](https://github.com/hedgedoc/hedgedoc). The reverse proxy can be chosen by preference. For development, we
recommend caddy and the provided configuration.

## Quick guide for development setup

This describes the easiest way to start a local development environment. For other deployments follow the description
below.
To run HedgeDoc 2.0 you need three components: the backend, the frontend and the reverse proxy.

Backend and Frontend are included in the [HegdeDoc repo](https://github.com/hedgedoc/hedgedoc). The reverse proxy can be chosen by preference. For development, we
recommend caddy and the provided configuration.

1. Install Node.js (at least Node 14, we recommend Node 18) and [Yarn](https://yarnpkg.com/getting-started/install)
2. Install Caddy (select one of the two options)
   - [Download](https://caddyserver.com/) and place the `caddy` binary in `hedgedoc/dev-reverse-proxy`. Ensure it is executable with `chmod +x caddy`. Users of macOS may need to run `xattr -d com.apple.quarantine ./caddy` to lift the quarantine for executables from the internet. 
   - Install Caddy using your package manager
3. Clone [our repository](https://github.com/hedgedoc/hedgedoc.git) and go into its directory
     ```shell
     git clone https://github.com/hedgedoc/hedgedoc.git
     cd hedgedoc
     ```
4. Install the dependencies in repo root directory with `yarn install`
5. Go to `hedgedoc/commons` directory with `cd ../commons`
6. Build the commons package with `yarn build`
7. Goto `hedgedoc/backend` directory with `cd ../backend`
8. Create the `.env` config file by copying the example: `cp .env.example .env`
9. Add a value to `HD_SESSION_SECRET` in the .env file. This can be any string, which has to be a secure password for production but can be set to simple string for debug purpose.
10. Execute the following lines
   ```shell
  echo "HD_AUTH_LOCAL_ENABLE_LOGIN=true" >> .env
  echo "HD_AUTH_LOCAL_ENABLE_REGISTER=true" >> .env
   ```
11. Start the backend using `yarn start:dev`
12. Go to  `hedgedoc/frontend` directory with `cd ../frontend`
13. Start the frontend using `yarn run dev:with-local-backend`
14. Go to `hedgedoc/dev-reverse-proxy` with `cd ../dev-reverse-proxy`
15. Start Caddy using `./caddy run` (if you've downloaded the binary manually) or `caddy run` (if you've installed Caddy using a package manager)
16. Use your browser to go to <http://localhost:8080>

## Preconditions

If you want to run HedgeDoc in dev mode some preconditions have to be met.

1. Make sure that NodeJS is installed. You need at least Node 14 (we recommend Node 18).
2. Make sure that [Yarn](https://yarnpkg.com/) is installed.
3. Clone this repo (e.g. `git clone https://github.com/hedgedoc/hedgedoc.git hedgedoc`)
4. Go into the cloned directory

## Installing the dependencies

Because we use Yarn workspaces, Yarn collects the dependencies of all packages automatically in one central top-level
`node_modules` folder.
To install the dependencies execute `yarn install` at the top level of the cloned repository.
Execute this command ONLY there. There is no need to execute the install-command for every package.
It's important to use [Yarn](https://yarnpkg.com/). We don't support `npm` or any other package manager and using anything
else than Yarn won't work.

## Build the `commons` package

Some code is shared by backend and frontend. This code lives in the `commons package and needs to be built so
frontend and backend can import it.
This only needs to be done once, except if you've changed code in the commons package.

1. Go into the `commons` directory.
2. Execute `yarn build` to build the commons package.

## Setting up the Backend

**Note:** The backend can be mocked instead of starting it for real. This is useful, if you just want to work on the frontend. See the "Mocked backend" section below.

1. Go into the `backend` directory.
2. Create an environment file. We recommend to use the example file by running `cp .env.example .env`
   You can modify this file according to the [configuration documentation](../config/index.md).
3. Make sure that you've set `HD_SESSION_SECRET` in your `.env` file. Otherwise, the backend won't start.
   > In dev mode you don't need a secure secret. So use any value. If you want to generate a secure session secret you
   can use e.g. `openssl rand -hex 16 | sed -E 's/(.*)/HD_SESSION_SECRET=\1/' >> .env`.
4. Make sure that `HD_DOMAIN` in `.env` is set to the domain where Hedgedoc should be available. In local dev
   environment this is most likely `http://localhost:8080`.
5. Start the backend by running `yarn start:dev` for dev mode or `yarn start` for production.

## Setting up the frontend

The frontend can be run in four different ways. The development mode compiles everything on demand. So the first time
you open a page in the browser it may take some time.
See [here](setup/frontend.md) for a more detailed description of the environment variables for the frontend.

### Mocked backend

To start the development mode, run `yarn run dev`.
By default, this will run in mock-mode, meaning instead of running a real backend the frontend mocks the backend.
This way you can work on frontend functionality without starting up the full development environment.
The app should run now and be available under [http://localhost:3001](http://localhost:3001) in your browser.
In development mode the app will autoload changes you make to the code.

### With local backend

To start the development mode with an actual HedgeDoc backend use `yarn run dev:with-local-backend` instead.
This task will automatically set `HD_EDITOR_BASE_URL` to `http://localhost:8080`.

### Production mode

Use `yarn build` to build the app in production mode and save it into the `.next` folder. The production build is
minimized and optimized for best performance. Don't edit the generated files in the `.next` folder in any way!

You can run the production build using the built-in server with `yarn start`.
You MUST provide the environment variable `HD_EDITOR_BASE_URL` with protocol, domain and (if needed) subdirectory path (
e.g. `http://localhost:3001/`) so the app knows under which URL the frontend is available in the browser.

If you use the production build then make sure that you set the environment variable `HD_EDITOR_BASE_URL` to the same
value as `HD_DOMAIN` in the backend.

### Production mock build

It is also possible to create a production build that uses the emulated backend by using `yarn build:mock`. This is
usually not needed except for demonstration purposes like `https://hedgedoc.dev`.

## Running backend and frontend together

To use backend and frontend together in development mode you'll need a local reverse proxy that combines both services
under one URL origin.
We recommend to use our pre-configured [Caddy](https://caddyserver.com/) configuration.

### Running the reverse proxy

1. Download the latest version of Caddy from [the Caddy website](https://caddyserver.com/) or alternatively install it
   using your package manager. You don't need any plugin. Place the downloaded binary in the
   directory `dev-reverse-proxy`. Don't forget to mark the file as executable using `chmod +x caddy`. Users of macOS may need to run `xattr -d com.apple.quarantine ./caddy` to lift the quarantine for executables from the internet.
2. Start Caddy using `./caddy run` (if you downloaded the binary manually) or `caddy run` (if you installed Caddy via a package manager).
3. Open your browser on http://localhost:8080
