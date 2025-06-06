import { dataDir } from "@tauri-apps/api/path";
import {
  BaseDirectory,
  createDir,
  readTextFile,
  removeDir,
  removeFile,
  writeTextFile,
  renameFile as tauriRenameFile,
} from "@tauri-apps/api/fs";
import { useEffect, useState } from "react";
import { FileProps, HoneyFile } from "@/app/types";
import { invoke } from "@tauri-apps/api/tauri";
import { readBinaryFile } from "@tauri-apps/api/fs";

export default function useFileSystem() {
  const [dataDirPath, setDataDirPath] = useState<string[]>([]);
  const [absolutePath, setAbsolutePath] = useState<string>("");

  useEffect(() => {
    //Creates the File Management Directory if it doesn't exist
    createDir("honeyos", { dir: BaseDirectory.Data, recursive: true }).then(
      (r) => {
        console.log("Directory created: ", r);
      }
    );

    //Fetches the data absolute path
    const setAbsPath = async () => {
      const path = await dataDir();
      setAbsolutePath(path);
    };
    setAbsPath().then((r) => console.log("absolute path set"));
  }, []);

  async function listDir() {
    // console.log("this is the directory", directory() + '\\' + honey_directory())
    const files: Array<FileProps> = await invoke("list_directory_with_times", {
      path: directory() + "\\" + honey_directory(),
    });
    const dirList: Array<HoneyFile> = [];
    files.map((file) => {
      const date = new Date(file.mtime * 1000).toLocaleDateString();
      const time = new Date(file.mtime * 1000).toLocaleTimeString();
      const size = file.is_dir
        ? "DIR    "
        : `${(file.size / 1024).toFixed(2)} KB`; // Check if it's a directory
      dirList.push({
        name: file.name,
        mtime: `${date} ${time}`,
        size: size,
        is_dir: file.is_dir,
        created_at: new Date(file.mtime * 1000).toLocaleString(),
      });
    });
    return dirList;
  }

  async function makeDir(path: string) {
    console.log("this is the new path", honey_directory() + "//" + path);
    await createDir("honeyos\\" + honey_directory() + "\\" + path, {
      dir: BaseDirectory.Data,
      recursive: true,
    });
  }

  const deleteDir = async (path: string) => {
    await removeDir("honeyos\\" + honey_directory() + "\\" + path, {
      dir: BaseDirectory.Data,
      recursive: true,
    });
  };

  const createFile = async (path: string) => {
    await writeTextFile("honeyos\\" + honey_directory() + "\\" + path, "", {
      dir: BaseDirectory.Data,
    });
  };

  const readFile = async (
    fileName: string
  ): Promise<{ status: boolean; content: string; isBinary?: boolean }> => {
    try {
      const ext = fileName.split(".").pop()?.toLowerCase();
      const filePath = "honeyos\\" + honey_directory() + "\\" + fileName;

      // Read image files as binary
      if (["png", "jpg", "jpeg", "gif"].includes(ext || "")) {
        const binary = await readBinaryFile(filePath, {
          dir: BaseDirectory.Data,
        });
        const base64 = Buffer.from(binary).toString("base64");
        const mime = `image/${ext === "jpg" ? "jpeg" : ext}`;
        return {
          status: true,
          content: `data:${mime};base64,${base64}`,
          isBinary: true,
        };
      }

      // Read text files as UTF-8
      const content = await readTextFile(filePath, {
        dir: BaseDirectory.Data,
      });
      return {
        status: true,
        content: content,
      };
    } catch (error) {
      return {
        status: false,
        content: String(error),
      };
    }
  };

  const writeFile = async (
    path: string,
    content: string
  ): Promise<{ status: boolean; message: string }> => {
    try {
      await writeTextFile(path, content, { dir: BaseDirectory.Data });
      return {
        status: true,
        message: "File saved successfully",
      };
    } catch (error) {
      return {
        status: false,
        message: error as string,
      };
    }
  };

  const deleteFile = async (path: string) => {
    await removeFile("honeyos\\" + honey_directory() + "\\" + path, {
      dir: BaseDirectory.Data,
    });
  };

  const renameFile = async (oldName: string, newName: string) => {
    const base = "honeyos\\" + honey_directory();
    await tauriRenameFile(`${base}\\${oldName}`, `${base}\\${newName}`, {
      dir: BaseDirectory.Data,
    });
  };

  const honey_directory = () => {
    return dataDirPath.join("\\");
  };

  const setHoneyDirectory = (path: string) => {
    setDataDirPath((prev) => [...prev, path]);
  };

  const directory = () => {
    return absolutePath + "honeyos";
  };

  const exitCurrentDir = () => {
    setDataDirPath((prev) => {
      const newDir = [...prev];
      newDir.pop();
      return newDir;
    });
  };

  return {
    listDir,
    createDir,
    deleteDir,
    createFile,
    makeDir,
    deleteFile,
    directory,
    honey_directory,
    setHoneyDirectory,
    exitCurrentDir,
    readFile,
    writeFile,
    renameFile,
    absolutePath,
    dataDirPath,
  };
}
