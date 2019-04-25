# A Rudimentary Execution Environment

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
{{#include ../../Cargo.toml::2}}
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

Well it doesn't *look* like anything blew up, so I guess that's a good thing.
But because the plugin doesn't emit any output (or even do any computation), 
it's a little hard to see if it actually ran...

## Letting a Plugin Interact with the Environment

If a plugin wants to do something useful, it'll need to interact with the 
outside world at some point. In WASM programs/libraries, this is accomplished by
the execution environment providing functions that the WASM can then *import*.
That's what the empty `wasmer_runtime::imports!()` from earlier was for.

In Rust, you can import a function from WASM's runtime environment using a 
normal `extern` block, so let's import a `print()` function which will print the
provided UTF-8 string. 


```rust
// hello-world/src/lib.rs

extern "C" {
    fn print(buffer: *const u8, length: u32) -> i32;
}

#[no_mangle]
pub extern "C" fn on_startup() {
    let message = "Hello, World!\n";
    unsafe {
        let bytes_written = print(message.as_ptr(), message.len() as u32);
        assert_eq!(
            bytes_written,
            message.len() as i32,
            "Something went wrong printing the message"
        );
    }
}
```

> **Note:** We need to use `unsafe` because there's no way for the compiler 
> to guarantee* the environment will follow Rust's rules regarding `const`, 
> or even that the `print()` function has the right signature.
>
> *In general!

Let's re-compile the `hello-world` plugin and see if it can print 
`"Hello, World!"` to the screen.

```console
$ cargo build --target wasm32-unknown-unknown                                       
   Compiling hello-world v0.1.0 (/home/michael/Documents/create-a-botnet/hello-world)
    Finished dev [unoptimized + debuginfo] target(s) in 0.17s

$ cargo run --package bot -- ../target/wasm32-unknown-unknown/debug/hello_world.wasm
    Finished dev [unoptimized + debuginfo] target(s) in 0.08s
     Running `/home/michael/Documents/create-a-botnet/target/debug/bot ../target/wasm32-unknown-unknown/debug/hello_world.wasm`
Error: LinkError([ImportNotFound { namespace: "env", name: "print" }])
$ echo $?
1
```

You'll notice execution failed with an `ImportNotFound` error. This is because
each WASM binary has a metadata section listing all the functions it wants to
import. Our execution environment hasn't provided a `print()` function, so the
`wasmer_runtime::instantiate()` function failed during validation.

Let's fix that:

```rust
// bot/src/main.rs

use std::env;
use std::error::Error;
use std::fs;
use wasmer_runtime::Ctx;

fn main() -> Result<(), Box<Error>> {
    let binary = env::args().nth(1).ok_or_else(|| {
        failure::err_msg("Usage: ./bot <wasm-binary>").compat()
    })?;
    let wasm = fs::read(&binary)?;

    let imports = wasmer_runtime::imports! {
        "env" => {
            "print" => wasmer_runtime::func!(print),
        },
    };

    let instance = wasmer_runtime::instantiate(&wasm, &imports)?;
    instance.call("on_startup", &[])?;

    Ok(())
}

/// Print a UTF-8 string stored in WASM memory.
fn print(ctx: &mut Ctx, buffer: u32, length: u32) -> i32 {
    // WASM memory is stored in one or more linear arrays, where pointers are
    // just indices into the array. At the moment wasmer only ever uses one
    // memory page, so we can get away with hard-coding first memory "page".
    let memory = ctx.memory(0);
    // and we want to view this page of memory as a bunch of u8's
    let view = memory.view::<u8>();

    // Translate the buffer "pointer" to indices and deal with out-of-bounds
    // errors.
    let start = buffer as usize;
    let end = start + length as usize;
    let bytes = match view.get(start..end) {
        Some(b) => b,
        None => {
            eprintln!("Read out of bounds");
            return -1;
        }
    };

    // Convert our &[Cell<u8>] to a string.
    let bytes: Vec<u8> = bytes.into_iter().map(|b| b.get()).collect();
    let message = match String::from_utf8(bytes) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("Unable to read the message as UTF-8, {}", e);
            return -1;
        }
    };

    // and now we can *finally* print the message
    print!("{}", message);

    message.len() as i32
}
```

You'll notice that the vast majority of work in `print()` was dedicated to 
translating arguments between the plugin's memory space and the executing 
program's. WASM only has 4 data types (`i32`, `i64`, `f32`, and `f64` in Rust 
parlance) that can be used when interacting with the environment, so that adds a
couple complications.

We'll make some nicer abstractions to simplify the process later on, but it'll
do for now.

Recompiling and executing:

```console
$ cargo run --package bot -- ../target/wasm32-unknown-unknown/debug/hello_world.wasm
    Finished dev [unoptimized + debuginfo] target(s) in 0.08s
     Running `/home/michael/Documents/create-a-botnet/target/debug/bot ../target/wasm32-unknown-unknown/debug/hello_world.wasm`
Hello, World! 
$ echo $?
0
```

Congratulations if you've stayed with me up til now. It may not look like much,
but we've covered most of the basics involved in embedding WASM in a Rust
program. Now we just need to build up some abstractions to make interactions 
between the execution engine and plugin easier.

## Exercises for the Reader

- What happens when the `print()` function defined in `hello-world`'s `extern` 
  block has a different signature to the one provided in `bot`?
- Why can't I change the signature of `bot`'s `print()` function to something
  nice like `print(&str) -> Result<usize, io::Error>`?
- Read through [The WASM-Bindgen Book][wasm-bindgen], in particular the
  *Internal Design* chapters. The developers already had to deal with the
  problems around accessing WASM memory, so we'll probably borrow some 
  inspiration from them.

[wasmer-runtime]: https://docs.rs/wasmer-runtime
[wasm-bindgen]: https://rustwasm.github.io/docs/wasm-bindgen/contributing/design/index.html
