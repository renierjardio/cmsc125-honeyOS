// // Prevents additional console window on Windows in release, DO NOT REMOVE!!
// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// fn main() {
//   tauri::Builder::default()
//     .run(tauri::generate_context!())
//     .expect("error while running tauri application");
// }

// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// use std::process::{Command, Stdio};
// use std::io::{BufRead, BufReader};
// use std::thread;
// use std::sync::mpsc;
// use tauri:Manager;

// fn main() {
//     // Create a channel to communicate between threads
//     let (tx, rx) = mpsc::channel();

//     // Spawn a thread to run the Python script
//     thread::spawn(move || {
//         let mut child = Command::new("python")
//             .arg("../vad.py")
//             .stdout(Stdio::piped())
//             .spawn()
//             .expect("Failed to start child process");

//         let stdout = child.stdout.take().expect("Failed to capture stdout");
//         let reader = BufReader::new(stdout);

//         for line in reader.lines() {
//             let line = line.expect("Failed to read line from child process");
//             tx.send(line).expect("Failed to send line to main thread");
//         }

//         let _ = child.wait().expect("Child process wasn't running");
//     });

//     // Spawn a thread to print lines from the Python script
//     thread::spawn(move || {
//       for line in rx {
//           println!("{}", line);
//       }
//     });

//     // Run the Tauri application in the main thread
//     let tauri_app = tauri::Builder::default()
//         .run(tauri::generate_context!())
//         .expect("error while running tauri application");

    

//     // Block the main thread until the Tauri application exits
// }


#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Command, Stdio};
use std::io::{BufRead, BufReader};
use std::thread;
use std::sync::mpsc;
use tauri::Manager;
use std::fs;
use std::path::Path;
extern crate sys_info;
use sysinfo::{System, RefreshKind, CpuRefreshKind};

#[tauri::command]
fn get_system_info() -> Result<String, String> {
    let mut system = System::new_with_specifics(RefreshKind::new().with_cpu(CpuRefreshKind::everything()));
    system.refresh_all();

    let cpu = system.cpus().get(0).ok_or("No CPU found")?;
    let cpu_name = cpu.brand();
    let cpu_speed = cpu.frequency();
    let total_ram = system.total_memory(); // in KB
    let disk_info = sys_info::disk_info().map_err(|e| e.to_string())?;

    let system_info = serde_json::json!({
        "cpu_name": cpu_name,
        "cpu_speed": cpu_speed,
        "ram": total_ram,
        "disk": disk_info.total,
    });

    Ok(system_info.to_string())
}

#[derive(serde::Serialize)]
struct FileEntry {
    name: String,
    mtime: u64,
    size: u64,
    is_dir: bool
}

#[tauri::command]
fn list_directory_with_times(path: String) -> Result<Vec<FileEntry>, String> {
    let entries = fs::read_dir(Path::new(&path))
        .map_err(|e| e.to_string())?
        .filter_map(|entry| {
            let entry = entry.ok()?;
            let metadata = entry.metadata().ok()?;
            let mtime = metadata
                .modified()
                .ok()?
                .duration_since(std::time::UNIX_EPOCH)
                .ok()?
                .as_secs();
            let size = metadata.len();
            let is_directory = metadata.is_dir();

            Some(FileEntry {
                name: entry.file_name().to_string_lossy().into_owned(),
                mtime,
                size,
                is_dir: is_directory
            })
        })
        .collect();

    Ok(entries)
}

fn main() {
    let context = tauri::generate_context!();
    let _app = tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_system_info,
            list_directory_with_times
        ])
        .setup(|app| {
            let app_handle = app.handle();
            let (tx, rx) = mpsc::channel();

            let honey_path = "C:\\honey";  // Use double backslashes in Windows paths
            if !fs::metadata(honey_path).is_ok() {
                match fs::create_dir(honey_path) {
                    Ok(_) => println!("'honey' directory created successfully at C:\\"),
                    Err(e) => eprintln!("Failed to create 'honey' folder at C:\\: {}", e),
                }
            }

            // Ensure that a folder named "root" is present inside "C:\\honey"
            let root_path = format!("{}\\root", honey_path);
            if !fs::metadata(&root_path).is_ok() {
                match fs::create_dir(&root_path) {
                    Ok(_) => println!("'root' directory created successfully inside 'honey'"),
                    Err(e) => eprintln!("Failed to create 'root' folder inside 'honey': {}", e),
                }
            }

            // Spawn a thread to run the Python script
            thread::spawn(move || {
                let mut child = Command::new("python")
                    .arg("../vad.py")  // Adjust the path to your Python script as necessary
                    .stdout(Stdio::piped())
                    .spawn()
                    .expect("Failed to start child process");

                let stdout = child.stdout.take().expect("Failed to capture stdout");
                let reader = BufReader::new(stdout);

                for line in reader.lines() {
                    let line = line.expect("Failed to read line from child process");
                    tx.send(line).expect("Failed to send line to main thread");
                }

                let _ = child.wait().expect("Child process wasn't running");
            });

            // Spawn a thread to listen for lines from the Python script and send them to the front end
            thread::spawn(move || {
                for line in rx {
                    app_handle.emit_all("transcribed_text", &line).expect("Failed to send transcribed text to front end");
                }
            });

            Ok(())
        })
        .run(context)
        .expect("error while running tauri application");

    // The Tauri application now runs until it is closed, with the event handling set up during initialization
}