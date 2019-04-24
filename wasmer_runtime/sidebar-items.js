initSidebarItems({"constant":[["VERSION","The current version of this crate"]],"enum":[["Export",""],["Value","Represents a WebAssembly value."]],"fn":[["compile","Compile WebAssembly binary code into a [`Module`]. This function is useful if it is necessary to compile a module before it can be instantiated (otherwise, the [`instantiate`] function should be used)."],["compile_with","Compile a [`Module`] using the provided compiler from WebAssembly binary code. This function is useful if it is necessary to a compile a module before it can be instantiated and must be used if you wish to use a different backend from the default."],["compile_with_config","The same as `compile` but takes a `CompilerConfig` for the purpose of changing the compiler's behavior"],["compile_with_config_with","The same as `compile_with_config` but takes a `Compiler` for the purpose of changing the backend."],["default_compiler","Get a single instance of the default compiler to use."],["instantiate","Compile and instantiate WebAssembly code without creating a [`Module`]."],["validate","Perform validation as defined by the WebAssembly specification. Returns `true` if validation succeeded, `false` if validation failed."]],"macro":[["func",""],["imports","Generate an [`ImportObject`] safely."]],"mod":[["cache",""],["error",""],["memory",""],["units","Various unit types."],["wasm","Various types exposed by the Wasmer Runtime."]],"struct":[["Ctx","The context of the currently running WebAssembly instance."],["DynFunc","A representation of an exported WebAssembly function."],["Func",""],["Global",""],["ImportObject","All of the import data used when instantiating."],["Instance","An instantiated WebAssembly module."],["Memory","A shared or unshared wasm linear memory."],["Module","A compiled WebAssembly module."],["Table",""]]});