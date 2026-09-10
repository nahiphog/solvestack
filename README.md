# Solver Sanctuary

I want to create a word ladder solver, where we input a starting 4 letter word, and a goal of another 4 letter word. I've uploaded a script where it shows each possible words' neighbors. And it will output all optimal paths.

For example, if the starting word is DUNK and the ending word is POOP, then the output will be three solutions, namely:

[['DARK', 'CARK', 'CORK', 'COOK', 'COOP', 'POOP'],

 ['DARK', 'DORK', 'CORK', 'COOK', 'COOP', 'POOP'],

 ['DARK', 'DORK', 'DORR', 'DOOR', 'POOR', 'POOP']]

Can you help me create this?

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://solvestack.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fecf7337-5c8a-42d4-8e26-68dcba69a5b6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
