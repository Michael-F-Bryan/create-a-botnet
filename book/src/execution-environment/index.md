# Setting Up the Execution Environment

Before we can get onto the interesting stuff we need to set up our project.

We'll be taking advantage of cargo workspaces to reduce compilation times and
ensure all dependencies are the same version, so make a top-level `Cargo.toml`
and set up the following project structure:

- `bot`: The execution environment (executable)
- `server`: The server (executable)
- `core`: The common interface shared between the execution environment and our
  "jobs" (library)
- `hello-world`: A dummy plugin which will be compiled to WASM (library)

```console
$ cargo new --lib core
$ cargo new --lib hello-world
$ cargo new --bin bot
$ cargo new --bin server
$ cat << EOF > Cargo.toml
{{#include ../../../Cargo.toml::2}}
EOF
```

## An Initial Execution Environment

For now we just want to get the bare minimum running. Luckily most of the hard
work of reading and JIT-compiling a WASM binary is done for us, in the form of
the [wasmer-runtime] crate.

Let's create a simple program to load a WASM binary, execute the `on_startup()`
function, and exit.

```console
$ cd bot
$ cargo add wasmer-runtime failure
$ cat src/main.rs

use std::env;
use std::error::Error;
use std::fs;

fn main() -> Result<(), Box<Error>> {
    let binary = env::args().nth(1).ok_or_else(|| {
        failure::err_msg("Usage: ./bot <wasm-binary>").compat()
    })?;
    let wasm = fs::read(&binary)?;

    let imports = wasmer_runtime::imports!();
    let instance = wasmer_runtime::instantiate(&wasm, &imports)?;
    instance.call("on_startup", &[])?;

    Ok(())
}
```

Amusingly, more lines are dedicated to imports, command-line arguments, and 
reading the file than actually executing it.

## Hello World

Now we've got a rudimentary execution environment up and running, we can start
implementing the functionality for our "bot".

The execution environment is *technically* only looking for a `on_startup()`
function with the signature `fn()`, so let's give it one.

```console
$ cd ../hello-world
$ cat src/lib.rs

#[no_mangle]
pub extern "C" fn on_startup() {}
```

And then compile it to WASM:

```console
$ cargo build --target wasm32-unknown-unknown
$ ls ../target/wasm32-unknown-unknown/debug/
build  deps  examples  hello_world.d  hello_world.wasm  incremental  native
```

With any luck, we should now be able to execute our `hello-world` plugin.

```console
$ cargo run --package bot -- ../target/wasm32-unknown-unknown/debug/hello_world.wasm
   Compiling bot v0.1.0 (/home/michael/Documents/create-a-botnet/bot)
    Finished dev [unoptimized + debuginfo] target(s) in 2.07s
     Running `/home/michael/Documents/create-a-botnet/target/debug/bot ../target/wasm32-unknown-unknown/debug/hello_world.wasm`
$ echo $?
0
```

Well it *looks* like we were able to successfully load the WASM plugin and 
execute its `on_startup()` method without any errors (`bot` finished with an 
exit code of `0`), but we didn't actually get to see anything...

[wasmer-runtime]: https://docs.rs/wasmer-runtime
