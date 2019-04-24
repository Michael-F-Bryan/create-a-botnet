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
