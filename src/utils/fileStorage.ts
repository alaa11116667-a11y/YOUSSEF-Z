/**
 * High-capacity IndexedDB storage for physics PDFs up to 200MB
 * Prevents Firestore document 1MB limit violations and keeps downloads inside the app.
 */

const DB_NAME = 'PhysicsPlatformStorage';
const DB_VERSION = 1;
const STORE_NAME = 'large_files';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save large PDF data (Blob, File, or base64) up to 200MB into IndexedDB
 */
export async function saveLargePdfLocally(id: string, file: Blob | File | string, fileName?: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = {
        id,
        file,
        fileName: fileName || `${id}.pdf`,
        savedAt: new Date().toISOString()
      };
      const req = store.put(record);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save to IndexedDB:', err);
    return false;
  }
}

/**
 * Retrieve large PDF from IndexedDB
 */
export async function getLargePdfLocally(id: string): Promise<Blob | string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result && req.result.file) {
          resolve(req.result.file);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.error('Failed to get from IndexedDB:', err);
    return null;
  }
}

/**
 * Trigger pure In-App download of a Blob or data URL
 * Ensures APK / WebView does NOT navigate to Chrome or trigger blank white page.
 */
export function downloadFileSafely(blobOrDataUrl: Blob | string, fileName: string) {
  try {
    let url: string;
    let shouldRevoke = false;

    if (blobOrDataUrl instanceof Blob) {
      url = URL.createObjectURL(blobOrDataUrl);
      shouldRevoke = true;
    } else if (typeof blobOrDataUrl === 'string' && blobOrDataUrl.startsWith('data:')) {
      // Convert base64 data URL to genuine Blob
      const parts = blobOrDataUrl.split(';base64,');
      const contentType = parts[0].split(':')[1] || 'application/pdf';
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      const blob = new Blob([uInt8Array], { type: contentType });
      url = URL.createObjectURL(blob);
      shouldRevoke = true;
    } else {
      url = blobOrDataUrl;
    }

    const cleanName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = cleanName;
    link.setAttribute('download', cleanName);
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      if (shouldRevoke) {
        URL.revokeObjectURL(url);
      }
    }, 1500);

    return true;
  } catch (err) {
    console.error('Download error:', err);
    return false;
  }
}

/**
 * Generate a printable, structured Physics PDF document on-the-fly
 * for study notes when no external file binary is attached.
 */
export function generatePhysicsPdfBlob(
  title: string,
  chapter: string,
  gradeLabel: string,
  summary: string,
  formulas?: string[]
): Blob {
  // Construct a minimal valid PDF 1.4 file format with vector text
  const safeTitle = title.replace(/[^\w\s\u0600-\u06FF]/gi, '');
  const dateStr = new Date().toLocaleDateString('ar-EG');
  
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 450 >>
stream
BT
/F1 20 Tf
50 780 Td
(AL-FEDAYEEN IN PHYSICS - ENG MOHAMED ALAA) Tj
/F1 14 Tf
0 -40 Td
(${safeTitle}) Tj
/F1 11 Tf
0 -30 Td
(Grade: ${gradeLabel} - Date: ${dateStr}) Tj
0 -25 Td
(Chapter: ${chapter}) Tj
0 -40 Td
(Summary: ${summary.slice(0, 120)}...) Tj
0 -40 Td
(Note: Visit the platform for full interactive calculations and Casio FX-991EX solutions.) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000224 00000 n 
0000000726 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
805
%%EOF`;

  return new Blob([content], { type: 'application/pdf' });
}
