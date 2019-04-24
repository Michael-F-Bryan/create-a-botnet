initSidebarItems({"constant":[["VERSION","Version number of this crate."]],"enum":[["GlobalInit","Globals are initialized via the four `const` operators or by referring to another import."],["GlobalVariable","The value of a WebAssembly global variable."],["ReturnMode","How to return from functions."],["TableElementType","WebAssembly table element. Can be a function or a scalar type."],["WasmError","A WebAssembly translation error."]],"fn":[["translate_module","Translate a sequence of bytes forming a valid Wasm binary into a list of valid Cranelift IR `Function`."]],"struct":[["DefinedFuncIndex","Index type of a defined function inside the WebAssembly module."],["DefinedGlobalIndex","Index type of a defined global inside the WebAssembly module."],["DefinedMemoryIndex","Index type of a defined memory inside the WebAssembly module."],["DefinedTableIndex","Index type of a defined table inside the WebAssembly module."],["DummyEnvironment","This `ModuleEnvironment` implementation is a \"naïve\" one, doing essentially nothing and emitting placeholders when forced to. Don't try to execute code translated for this environment, essentially here for translation debug purposes."],["FuncIndex","Index type of a function (imported or defined) inside the WebAssembly module."],["FuncTranslator","WebAssembly to Cranelift IR function translator."],["Global","WebAssembly global."],["GlobalIndex","Index type of a global variable (imported or defined) inside the WebAssembly module."],["Memory","WebAssembly linear memory."],["MemoryIndex","Index type of a linear memory (imported or defined) inside the WebAssembly module."],["SignatureIndex","Index type of a signature (imported or defined) inside the WebAssembly module."],["Table","WebAssembly table."],["TableIndex","Index type of a table (imported or defined) inside the WebAssembly module."]],"trait":[["FuncEnvironment","Environment affecting the translation of a single WebAssembly function."],["ModuleEnvironment","An object satisfying the `ModuleEnvironment` trait can be passed as argument to the `translate_module` function. These methods should not be called by the user, they are only for `cranelift-wasm` internal use."]],"type":[["WasmResult","A convenient alias for a `Result` that uses `WasmError` as the error type."]]});