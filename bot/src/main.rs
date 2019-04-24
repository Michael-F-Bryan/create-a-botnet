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
