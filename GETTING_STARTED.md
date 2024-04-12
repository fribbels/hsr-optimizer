# Getting started
#### Install NodeJS & NPM
Currently, the best balance between legacy dependencies and future direction is `node v18.19.0` - if this changes, it will be reflected in the `.node-version` file in the root directory.
We suggest using a Node version manager such as [NVM](https://github.com/nvm-sh/nvm) or [FNM](https://github.com/Schniz/fnm) to quickly switch between this project and any other node/js project you are working in.

#### Install project dependencies
`npm install`
If you see install failures due to depedency graph failures, try:
`npm install --legacy-peer-deps`
If you still see failures, please report an [issue](https://github.com/fribbels/hsr-optimizer/issues/new)!

#### Confirm your environment is stable and working
`npm start` from the root directory.  In a moment, your default browser should open to the local server and HSR Optimizer will load after a few moments.
