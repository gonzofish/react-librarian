# React Librarian

[![Build Status](https://semaphoreci.com/api/v1/gonzofish/react-librarian/branches/master/badge.svg)](https://semaphoreci.com/gonzofish/react-librarian)
[![codecov](https://codecov.io/gh/gonzofish/react-librarian/branch/master/graph/badge.svg)](https://codecov.io/gh/gonzofish/react-librarian)
[![npm version](https://badge.fury.io/js/react-librarian.svg)](https://badge.fury.io/js/react-librarian)

A scaffolding setup for building React component libraries.

- [Usage](#usage)
- [Generative Commands](#generative-commands)
    - [Component](#component)
    - [Initialize](#initial)
- [Project Commands](#project-commands)
    - [Build](#build)
    - [Lint](#lint)
    - [Tag Version](#tagVersion)
    - [Test](#test)
- [Contributing](#contributing)

## <a id="usage"></a>Usage

### Create an Empty Project

```shell
> mkdir my-new-project
> cd my-new-project
> npm init -f
```

### Install

Use NPM or Yarn to install:

```shell
> npm install react-librarian --save-dev
# or
> yarn add react-librarian --dev
```

### Initialize Your Project

Call the initialize command, which will provide defaults where possible. To use
a default, just press `<Enter>`.

```shell
> node ./node_modules/react-librarian i

Library name (my-new-project):
Repository URL: https://my.repo/proj
Version (1.0.0):
README Title (My New Project): My Project
Initialize Git (Y)? N
# Project is scaffolded
# Node modules installed
```

## <a id="generative-commands"></a>Generative Commands

Generative commands will scaffold out parts of your library. To use, just run:

```shell
npm run g <command> [<args>]
```

Command|Purpose
---|---
[component](#component)|Create a component
[initial](#initial)|Set up a library project

### <a id="component"></a>Component (alias: c, comp)

```shell
npm run g c <type> <tag>
npm run g c <tag>
npm run g c
```

#### Arguments

- `<type>`: can be any of the following
  - For a class component: `c`, `cl`, `class`
  - For a functional component: `f`, `fn`, `func`, `function`, `functional`
- `<tag>`: must be a `PascalCase`-formatted string, containing only letters

#### Prompts

- `Tag name (in PascalCase):` the tag to use for the component
- `Component type:` the type of component to scaffold (functional or class)

If either value is properly provided as part of the command, that question
will be removed.

#### Output

In the `src/components` directory a `.tsx` file will be created, as well as a
`.spec.tsx` file in `src/components/__tests__`

```shell
|__src
   |__ __tests__
      |_<tag>.spec.tsx
   |__<tag>.tsx
```

### <a id="initial"></a>Initial (alias: i, init, initial, initialize)

```shell
npm run g i
```

#### Prompts

- `Library name:` what's the name of your library, in dash-case, this can also
  accept scoped packages (`@scope/my-pkg`); defaults to the `name` attribute of
  `package.json`
- `Repository URL:` the URL of your library's repository; defaults to the
  `repository.url` value of `package.json`, if present
- `Version:` the version of your library; defaults to the `version` value of
  `package.json`
- `README Title:` the value to insert as the title of the `README.md` file;
  defaults to the library name as words (so `my-pkg` becomes `My Pkg`)
- `Initialize Git?`/`Re-initialize Git?`: if Git has NOT been set up, this will
  ask if you want to set it up with a default of `Y`; if Git has been set up,
  this will ask if you want to re-initialize Git, with a default of `N`

#### Output

Creates the project structure and a slew of files. Note that, below, the
`First component name` is a `PascalCase` version of your library name. This
means `my-pkg` becomes `MyPkg`.

```
|__configs/
   |__tsconfig.build.json
   |__tsconfig.es2015.json
   |__tsconfig.es5.json
   |__webpack.config.js
|__example/
   |__App.tsx
   |__index.html
   |__vendor.tsx
|__node_modules/
   |__ ...
|__src/
   |__components/
      |__ __tests__
         |__<First component name>.spec.tsx
      |__<First component name>.spec.tsx
   |__index.ts
|__tasks/
   |__build.js
   |__glob-copy.js
   |__rollup.js
   |__tsc.js
|__.erector
|__.gitignore
|__README.md
|__package-lock.json
|__package.json
|__tsconfig.json
|__tslint.json
```

- `configs`: the location of TypeScript build configurations & the webpack
  configuration file
  - `configs/tsconfig.build.json`: the base build config for TypeScript,
    inherits from the root `tsconfig.json`
  - `configs/tsconfig.es2015.json`: the ES2015 build config for TypeScript,
    inherits from `tsconfig.build.json`
  - `configs/tsconfig.es5.json`: the ES5 build config for TypeScript,
    inherits from `tsconfig.build.json`
  - `configs/webpack.config.js`: the Webpack config for running the Webpack Dev
    Server, which pulls code from the `example` & `src` directories
- `example`: where the code for running the example application
  - `example/App.tsx`: the base application file for the example
  - `example/index.html`: the HTML page for the example
  - `example/vendor.tsx`: the 3rd party libraries required, imports `react`
    and `react-dom`;
- `node_modules`: all the modules installed by NPM
- `src`: where all of the library code & test code lives
  - `src/components`: where components are scaffolded to
    - `src/components/__tests__`: where the tests for components live
      - `src/components/__tests__/<First component name>.spec.tsx`: the test file
        for the first component
    - `src/components/<First component name>.spec.tsx`: the first component
  - `src/index.ts`: the main library file which exports any components for public
    consumption
- `tasks`: contains all the scripts for building & testing
  - `tasks/build.js`: the main file for building out the library, uses the all
    of the other scripts
  - `tasks/glob-copy.js`: for easy copying of files during build
  - `tasks/rollup.js`: runs Rollup.js to shake out any unused code and create
    different package types (ES2015, ES5, and UMD)
  - `tasks/tsc.js`: the TypeScript runner for compiling files down via
    the TypeScript compiler
- `.erector`: a cache of the answers to the initialization prompts
- `.gitignore`: all of the files for Git to ignore
- `README.md`: the README file for your project
- `package-lock.json`: the lock file for NPM (if using NPM >= 6)
- `package.json`: the project configuration file
- `tsconfig.json`: the base TypeScript config
- `tslint.json`: the linting configuration for TypeScript files


## <a id="project-commands"></a>Project Commands

These are commands for developing with your library. All commands
are run via `npm run <command>`.

Command|Purpose
---|---
[build](#build)|Runs code through TypeScript & Rollup to produce consumable packages
[lint](#lint)|Verify code matches linting rules
[tagVersion](#tagVersion)|Use `np` to verify your project is ready to publish, then build & publish it
[test](#test)|Run unit tests through Jest

### <a id="build"></a>Build

Build the library's code via TypeScript & Rollup. The built code will end up in
the `dist` directory.

#### Call Signature

```shell
> npm run build
```

### <a id="lint"></a>Lint

Verify that all source code matches TSLint rules.

#### Call Signature

```shell
> npm run lint
```

### <a id="tagVersion"></a>Tag Version

Run project through [`np`](https://github.com/sindresorhus/np) to prepare for
publishing, then build the code & publish it. This will ask you a series of
questions, which will update your `package.json`, tag your code, and push it
to your repository. After that `npm run build` will execute, followed by an
`npm publish dist`

#### Call Signature

```shell
> npm run tagVersion
```

### <a id="test"></a>Test

Run unit tests through Jest. There are three flavors of tests:

- Basic: just runs tests through Jest
- Coverage (`cov`): which will run your tests and output test coverage
- Watch (`watch`): for continuous test development; watches your files as your
  code, re-running tests as files are saved and outputting coverage

#### Call Signatures

```shell
> npm test
> npm run test
> npm run test:cov
> npm run test:watch
```

## <a id="contributing"></a>Contributing

If you'd like to contribute to React Librarian, please see the [contribution guide](.github/CONTRIBUTING.md)!
