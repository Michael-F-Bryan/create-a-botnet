# A Better Plugin Interface

The current method of exporting an `on_startup()` function is... okay... for a
plugin, but in Rust we can do a lot better.

Throughout its lifetime, each job/plugin will go through several lifecycle
stages. It'd be nice if we could encode this in the type system using traits.

Maybe something like this:

```rust
trait Plugin {
    /// Start the plugin.
    fn start(&self);
}
```
