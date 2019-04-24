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
