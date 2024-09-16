import React, { useState, useEffect, ChangeEvent } from 'react';

// Definiowanie typu dla danych formularza
interface FormData {
    id: number;
    title: string;
    description: string;
}

// Funkcja do otwierania lub tworzenia bazy danych
const openDB = async (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('myDatabase', 1);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('formData')) {
                db.createObjectStore('formData', { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result);
        };

        request.onerror = (event) => {
            reject((event.target as IDBOpenDBRequest).error);
        };
    });
};

// Funkcja do zapisywania danych w IndexedDB
const saveData = async (data: FormData): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction('formData', 'readwrite');
    const store = transaction.objectStore('formData');
    store.put(data);
};

// Funkcja do wczytywania danych z IndexedDB
const loadData = async (): Promise<FormData | undefined> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('formData', 'readonly');
        const store = transaction.objectStore('formData');
        const request = store.get(1);

        request.onsuccess = (event) => {
            resolve((event.target as IDBRequest<FormData>).result);
        };

        request.onerror = (event) => {
            reject((event.target as IDBRequest).error);
        };
    });
};

const MyForm: React.FC = () => {
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');

    // Wczytanie danych po załadowaniu komponentu
    useEffect(() => {
        const fetchData = async () => {
            const data = await loadData();
            if (data) {
                setTitle(data.title || '');
                setDescription(data.description || '');
            }
        };
        fetchData();
    }, []);

    // Obsługa zapisu do IndexedDB przy zmianie wartości
    const handleSave = async () => {
        await saveData({ id: 1, title, description });
    };

    // Obsługa zmiany pola tytułu
    const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        handleSave();
    };

    // Obsługa zmiany pola opisu
    const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value);
        handleSave();
    };

    return (
        <form onSubmit={(e) => e.preventDefault()}>
            <div>
                <label>
                    Title:
                    <input
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                    />
                </label>
            </div>
            <div>
                <label>
                    Description:
                    <textarea
                        value={description}
                        onChange={handleDescriptionChange}
                    ></textarea>
                </label>
            </div>
        </form>
    );
};

export default MyForm;