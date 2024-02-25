# Contributing to HSR Optimizer

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## We develop with Github
We use github to host code, to track issues and feature requests, as well as accept pull requests.

## Communication via discord
We use the #dev channel on discord https://discord.gg/rDmB4Un7qg for communication/questions. Responses on discord will generally be faster than Issues or comments. 

## We use [Github Flow](https://docs.github.com/en/get-started/using-github/github-flow), so all code changes happen through pull requests
Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `beta`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Report bugs using Github's [issues](https://github.com/fribbels/hsr-optimizer/issues)
We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/fribbels/hsr-optimizer/issues/new); it's that easy!

## Write bug reports with detail, background, and sample code
Bugs should include reproduction steps, screenshots, and if possible, the metadata to reproduce the issue.  Exporting the HSR Optimizer database is a great start; attach it to your new issue!

## Use a consistent coding style
* 2 spaces for indentation rather than tabs
* Enable auto-format on save in your IDE using the lint settings or run `npm run lint` for style unification

## Your first issue & pull request
- Check current issues in the [BACKLOG](https://github.com/users/fribbels/projects/2)
- Priority stack ranking and rough project status can be found in the [PRIORITY BOARD](https://github.com/users/fribbels/projects/2/views/2)
- Find an issue to work on and set it status to `In Progress` by moving it from the Backlog column to the In Progress column.  *This lets other contributors know that the issue is being worked on!*

After you have forked the repo and switched to the `beta` branch, create your working branch:
```
git checkout -b [feature|fix]/[your-branch-name]
```

## Suggested commit message format
Each commit message consists of a **header**, a **body**, and a **footer**. The header has a special format that includes a **type**, a **scope**, and a **subject**:

***The header is mandatory and the scope of the header is optional.***
```
<header>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

Any line of the commit message cannot be longer than 100 characters! This allows the message to be easier to read on GitHub as well as in various git tools.

#### Type: must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries such as documentation generation

#### Scope
The scope could be anything specifying the place of the commit change. For example *component, utils, core, etc*.

Scope can reference the issue your commit is addressing. In the following example, github will parse `#15` to link back to [Issue 15](https://github.com/fribbels/hsr-optimizer/issues/15) in the backlog.
```
feat(#15): foo bar baz
```

#### Subject
The subject contains a succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize the first letter
- no dot (.) at the end

#### Body
Just as in the subject, use the imperative, present tense: "change" not "changed" nor "changes". The body should include the motivation for the change and contrast this with previous behavior.

#### Footer
The footer should contain any information about Breaking Changes and is also the place to reference GitHub issues that this commit Closes.

Breaking Changes should start with the word BREAKING CHANGE: with a space or two newlines. The rest of the commit message is then used for this.

##### Examples:
Standard commit message:
```
feat(#46): enable double-click navigation from Character to Optimizer
```

Commit message with header & body:
```
fix(schema): fixes metadata filtering when using Optimizer side-bar

changes to schema require a rebuild/re-import
```

Breaking Change commit message:
```
BREAKING CHANGE

fix(dependencies): upgrade typescript to latest

current types are compatible

new types must use latest typing syntax!
```