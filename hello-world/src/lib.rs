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
