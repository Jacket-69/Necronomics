// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // Force X11 backend to avoid Wayland protocol errors with webkit2gtk
    std::env::set_var("GDK_BACKEND", "x11");
    // Disable hardware acceleration to fix white screen (GBM buffer creation failure)
    std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");
    necronomics_lib::run()
}
