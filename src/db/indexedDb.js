// Worship Studio - IndexedDB Local Persistence Engine
// Preserves exact database name and object store from original application

const DB_NAME = "worship-studio";
const STORE_NAME = "projects";
const DB_VERSION = 1;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllProjects() {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("IndexedDB getAll error:", err);
    return [];
  }
}

export async function saveProject(project) {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({
        ...project,
        updatedAt: new Date().toISOString()
      });
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("IndexedDB save error:", err);
    throw err;
  }
}

export async function deleteProject(id) {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("IndexedDB delete error:", err);
    throw err;
  }
}

export function createDefaultProject(title = "Sunday Worship") {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `proj_${Date.now()}`,
    title: title,
    kind: "song",
    updatedAt: new Date().toISOString(),
    lyrics: "",
    sections: [],
    slides: [
      {
        id: crypto.randomUUID ? crypto.randomUUID() : `slide_${Date.now()}`,
        text: "Your lyrics will appear here",
        themeId: "sunrise-photo",
        transition: "fade"
      }
    ],
    themeId: "sunrise-photo",
    font: "Cormorant Garamond",
    fontSize: 34,
    panelOpacity: 28,
    glow: 35,
    textColor: "#fffaf0",
    panel: true,
    bold: true,
    italic: false,
    textAlign: "center",
    watermarkVisible: true,
    watermarkOpacity: 40
  };
}

