# puppeteer_order_bot
A bot based on Puppeteer to make orders through a web store 

Currently set up for OpenCart, but other stores can be added by adding a configuration 
to the `PuppeteerService` module and updating the `CustomerOrderFacade` module to use 
the new configuration.

## Installation

- clone this repo
- `npm install`

If typescript has not been installed, run (global install is recommended):
`npm install -g typescript ts-node`

Transpile typescript
`npm run build`

## Configuration

### Environment
- copy `.env.example` to `.env`
- fill in real values for `OPEN_CART_EMAIL` and `OPEN_CART_PASSWORD` in `.env`
- the app uses `NODE_ENV` to determine which .yaml file in `/config` to use. To add an additional
environment context (e.g. `staging` or `production`), duplicate one of the `<environment>.yaml`
files in `/config` and give it a filename matching the environment name exactly (e.g. `staging.yaml`
or `production.yaml`)

### Application
- configuration settings for the app reside in .yaml files in the `/config` folder.
- implementation of the configuration settings are applied in the `startup.ts` file, which builds
and exports a `config` object, available for import anywhere in the app.

## Run
*NOTE:* The code assumes a currently empty cart for the test user (e.g. test@rupahealth.com), and
does not, as of 2022-05-19, prompt the user on the command line to ensure this condition, nor does
it automatically clear existing items in the test user's cart. When running the app, the user should
first ensure that the test user's cart is empty. The app will throw an error during checkout if the items
in the cart don't match the items in the order.

The app can be run from the command line, using `ts-node`
- cd into the app root directory, `puppeteer_order_bot`
- `ts-node src/index.ts`
- the app will use the PuppeteerService in non-headless mode, and output an activity log and
an array of results to the console (in production, we would save the log and results to a persistence
layer, e.g. to log files)
- the app was built and tested in non-headless mode (the puppeteer options are available in the 
`PuppeteerService` module). It won't currently work in headless mode, but with further tweaks it would
be possible to make it work that way as well.

The app can be run using `node` in place of `ts-node` on the command line, or built into a web-based UI,
using `node dist/index.js`

The `PuppeteerService` module can be run directly for manual testing purposes. 
It uses the `if (require.main === module) {...}` method to isolate its `main()` function when
the module is not being run directly. In production the `main()` function and sample code can be
removed without consequence.

## Test

Tests are run using Jest.

`npm run test`

Run tests in watch mode
`npm run test -- --watch`

There is no unit or test code written for the `PuppeteerService` module itself. Its end-to-end functionality
is coupled to the web store itself, and its core functionality is the responsibility of the Puppeteer
developer, meaning that any proper level of mocking would mock out the entire feature set for that module.

In production, test coverage would ideally include integration tests for the `CustomerOrderFacade` module
and end-to-end tests for the app itself.

## Notes

### About the app structure and patterns
I've used a version of Robert Martin's "Clean Architecture" as the basic structure, with the following
folder/layer hierarchy ("inside" layers first):
- entities, core
- usecases, data
- controllers, services

While it can be overkill to apply an architecture pattern to such a simple app, it does offer a
code and folder structure on which to hang best practice. 

In a similar way, while a one-off app doesn't strictly need an implementation of the facade pattern
wrapped around a service provider (see `CustomerOrderFacade` and `PuppeteerService` modules), it
represents a structure that would certainly be used in production for this kind of app, to
ensure minimal coupling between the app code and Puppeteer itself, to keep things modular,
and to isolate and clarify responsibility. It also separates out the components in a way that ensures
testability and test isolation.

### About Packages
In general, I try to minimize external package use, except where the efficiency of leaning on solved
problems outweighs the added complexity, maintenance requirements, and coupling of the app code to
a framework or service.

When package dependencies are introduced, packages with active, recent development, a high number
of downloads, small size, and minimal complexity are preferred.

Notes about packages and their implementation:
#### dependencies
- `puppeteer` and `@types/puppeteer`
  - a requirement of the coding challenge
  - implemented in the app as a service provider, with a facade separating it from the core app code,
  in order to minimize coupling to the package
- `dotenv`
  - a simple, popular solution for parsing and using .env files in node environments
- `yaml`
  - yaml files are a good choice for configuration files because they:
    - have a well-defined spec
    - do not have the overhead or required runtime of .js files
    - allow comments by default, unlike .json files (the json spec, on its own, doesn't allow comments)
  - the `yaml` package is a lightweight version of a yaml parser

#### devDependencies
- `jest`, `@types/jest`, `jest-puppeteer`, `ts-jest`
  - Jest is a good test framework that allows typescript testing directly, a test language that
  facilitates unit tests as well as spec/behaviour style tests, extendable expectations, and mocking
  - `jest-puppeteer` is one of the many jest extensions that lets it cover additional contexts and
  frameworks
- `ts-node`, `typescript`, `tslint`
  - Typescript makes JavaScript a mature language and facilitates coding best practices and patterns
  - `ts-node` provides a runtime that allows us to run typescript code directly, without needing to
  wait for transpilation or deal with the many quirks of transpiled js during development

### About OpenCart

It's a good idea, when building any web scraper, to see if there's an available API that can be
tapped into instead, or in concert with the web scraping.

In the case of OpenCart, this requires an API key that can be generated using an admin account
in the OpenCart web store, which is outside the scope of this project, so only public APIs and
URLs were used.

#### Puppeteer <=> OpenCart interaction

Puppeteer is implemented in this app via the `PuppeteerService` module, and the OpenCart configuration
is included in the `PuppeteerService` module, as opposed to the app's configuration itself, as
`PuppeteerService` is responsible for the coupling between Puppeteer and OpenCart, while the app's
core responsibility is to fulfill customer orders, separate from the service provider implementation. 

#### API Docs
https://docs.opencart.com/en-gb/system/users/api/

#### API route pattern
http://opencart.abstracta.us/index.php?route=api/cart/add

### Tradeoffs
- Working through all the little quirks in OpenCart's UI and addressing every issue when interacting with
it via Puppeteer, vs. using page.waitForTimeout() in some places. Hard coded timeouts are always a
compromise compared to proper asynchronous handling and inversion of control, but at some point one
has to ship the code.
- Greater test coverage vs shipping the code and updating it later. While BDD/TDD and good test coverage
for all test scopes and app features is ideal, getting the features complete and shipped has to be a
priority as well. In the case of this coding exercise, there is unlikely to be any "updating it later",
but neither is there a public-facing use case nor long-term maintenance, so they balance out.
- Complete error handling for all cases vs error handling for the most common or critical cases.

### What I would change
- More test coverage, including some level of mocking for OpenCart itself, though the functionality
of the app is so coupled to the target web store, using a test account for the live store might
be most appropriate. I've used a "yellow-red-green-refactor" pattern for test writing, which involves
writing the spec/requirements as `todo` or `skipped` test descriptions, writing the critical test code
right away, and writing the remaining tests as soon as possible. This accommodates the realities of
time constraints as well as allowing for a shifting spec during development without having to rewrite
code twice (spec and implementation).
- Some form of logging of order runs and results in a persistence layer, most likely a set of files, rather
than simply console output
- In concert with the previous point, a way of controlling and configuring the logging itself (including
control over different log levels – it's not best practice to leave `console.log` calls in production code,
but it is an acceptable pattern to leave logging calls throughout the code with intentional levels)
- Warn the user against having existing items in the cart (e.g. from a previous session without a
complete checkout), or handle that case in the app itself when it runs – possibly a prompt to the user
to confirm if the existing items should be deleted or possibly saved.
- A more reliable way of retrieving the newly generated order id from the web store. The method I employed
in this app assumes no checkouts have happened since the automated checkout. I looked in the generated HTML
in the browser, but no order id is available on the post-checkout page, and it's not added to the response
headers. A more reliable method might perform some additional comparisons (like order date and time, total cost,
etc.) or make use of an order id API.
- Not all exceptions are handled. More try/catch blocks could be added, especially where errors may
be thrown within async function calls, and error handling could be subject to test coverage as well.
- A CI pipeline with automated testing, if the app were bound for production and/or if there were
multiple developers working on it.
- The `checkout()` function on the `PuppeteerService` class is too long (over 100 lines). I would extract
the individual checkout steps to their own functions.
- I decided to use the default (latest available) version of Chromium that's bundled with Puppeteer.
If this app were maintained in the long term, I'd add a puppeteer configuration so that Chromium would
be a separate dependency, independently configured, and the puppeteer package would depend on it.
- There's a TODO remaining in the code. It's generally considered bad form to leave TODO comments in
code that gets pushed to a shared repo, unless the team has agreed collectively that TODO comments are
a helpful and efficient part of the development practice. I left this one in since it marks out a
known issue (the app fails if there are existing items in the user's cart when the app is run) and
the place in the code where it should be fixed.

### Time and resources
The app in its current form took 15-20 hours. A simpler bot with less structure and fewer edge cases covered
would take less time, a bot with a more robust user interface and logging would take more.
