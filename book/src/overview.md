# Creating a Botnet - A Thought Experiment on Using WASM for Plugins

There's a lot of fuss being made in the *Rust* community about *Web Assembly*.
In particular the ability to compile *Rust* (or any other supported language) to
an architecture-independent binary format for executing sandboxed code.

I think this is awesome.

The first thing which comes to mind is using WASM for dynamically adding 
functionality to a program (commonly referred to as a *plugin*), and what better
way to explore this than implementing our own crappy botnet?

## The Rough Design

Our botnet will be composed of a couple main parts:

- The server - for serving up "jobs" to execute
- The execution environment - a sandbox for executing jobs and letting them 
  interact with the wider world
- The jobs to be executed - WASM modules which expose some sort of `Plugin` 
  interface

> **Note:** Because this is only a thought experiment, I won't be going into 
> the mechanism used for *spreading* our bots.  This isn't really relevant to
> WASM and plugins, so I'll just be running the execution environment on
> machines I own (this is one of the things which separate "real" botnets and
> most online cloud platforms 😜).

## See Also

- [RustLatam 2019 - Kevin Hoffman: WebAssembly with Rust](https://youtu.be/YDQICTKlr9g)
- [Rust Cologne: WASM in the wild](https://youtu.be/ULQRGXziF3s)
- [🤠 The Wrangler CLI: Deploying Rust with WASM on Cloudflare Workers](https://blog.cloudflare.com/introducing-wrangler-cli/)
- [Serverless Rust with AWS Lambda and WebAssembly](https://blog.scottlogic.com/2018/10/18/serverless-rust.html)
