import React, { useState, useEffect, ChangeEvent } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import Cookies from 'js-cookie';

// Define the type for form data
interface FormData {
    id: number;
    title: string;
    description: string;
    date: string;
}

// Function to open or create the database
const openDB = async (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('myDatabase', 1);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('formData')) {
                db.createObjectStore('formData', { keyPath: 'id', autoIncrement: true });
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

// Function to save data to IndexedDB
const saveData = async (data: FormData): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction('formData', 'readwrite');
    const store = transaction.objectStore('formData');
    store.put(data);
};

// Function to load all data from IndexedDB
const loadAllData = async (): Promise<FormData[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('formData', 'readonly');
        const store = transaction.objectStore('formData');
        const request = store.getAll();

        request.onsuccess = (event) => {
            resolve((event.target as IDBRequest<FormData[]>).result);
        };

        request.onerror = (event) => {
            reject((event.target as IDBRequest).error);
        };
    });
};

// Function to delete data from IndexedDB by ID
const deleteData = async (id: number): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction('formData', 'readwrite');
    const store = transaction.objectStore('formData');
    store.delete(id);
};

const DragAndDropFormList: React.FC = () => {
    const [items, setItems] = useState<FormData[]>([]);
    const [visibleDescriptions, setVisibleDescriptions] = useState<string | null>(null);
    const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
    const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null);

    const saveOrderToCookies = (newOrder: FormData[]) => {
        const orderIds = newOrder.map((item) => item.id);
        Cookies.set('itemOrder', JSON.stringify(orderIds), { expires: 7 });
    };

    const loadOrderFromCookies = (loadedItems: FormData[]): FormData[] => {
        const savedOrder = Cookies.get('itemOrder');
        if (savedOrder) {
            const orderIds = JSON.parse(savedOrder) as number[];
            const reorderedItems = orderIds
                .map((id) => loadedItems.find((item) => item.id === id))
                .filter((item): item is FormData => item !== undefined);
            return reorderedItems;
        }
        return loadedItems;
    };

    useEffect(() => {
        const fetchData = async () => {
            const loadedData = await loadAllData();
            const orderedData = loadOrderFromCookies(loadedData);
            setItems(orderedData);
        };
        fetchData();
    }, []);

    const handleOnDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const reorderedItems = Array.from(items);
        const [reorderedItem] = reorderedItems.splice(result.source.index, 1);
        reorderedItems.splice(result.destination.index, 0, reorderedItem);

        setItems(reorderedItems);
        saveOrderToCookies(reorderedItems);
    };

    const handleAddNewItem = async () => {
        const newItem: FormData = {
            id: Date.now(),
            title: '',
            description: '',
            date: new Date().toLocaleString('pl-PL', { // Ustawienie bieżącej daty w odpowiednim formacie
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }),
        };
        setItems((prevItems) => [newItem, ...prevItems]);
    };

    const handleTitleChange = (e: ChangeEvent<HTMLInputElement>, id: number) => {
        const newTitle = e.target.value;
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, title: newTitle } : item
            )
        );
    };

    const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>, id: number) => {
        const newDescription = e.target.value;
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, description: newDescription } : item
            )
        );
    };

    const handleSaveItem = async (id: number) => {
        const updatedItems = items.map((item) =>
            item.id === id
                ? {
                    ...item,
                    date: new Date().toLocaleString('pl-PL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    }),
                }
                : item
        );

        setItems(updatedItems);

        const itemToSave = updatedItems.find((item) => item.id === id);
        if (itemToSave) {
            await saveData(itemToSave); // Zapisz dane do IndexedDB
            saveOrderToCookies(updatedItems); // Zapisz kolejność po aktualizacji
        }
    };

    const handleRemoveItem = async (id: number) => {
        await deleteData(id);
        setItems((prevItems) => {
            const updatedItems = prevItems.filter((item) => item.id !== id);
            saveOrderToCookies(updatedItems); // Zapisz kolejność po aktualizacji stanu
            return updatedItems;
        });
        setConfirmRemoveId(null);
    };

    const toggleDescription = (id: string) => {
        setVisibleDescriptions((prevId) => (prevId === id ? null : id));
    };
    const showDescription = (id: string) => {
        setVisibleDescriptions(id);
        setIsDescriptionVisible(true); // Dodanie klasy
    };

    const hideDescription = (id: string) => {
        setVisibleDescriptions(null);
        setIsDescriptionVisible(false); // Usunięcie klasy
    };

    const handleConfirmRemoveItem = (id: number) => {
        setConfirmRemoveId(id);
    }

    return (
        <div className={`notepad ${isDescriptionVisible ? 'notepad-single' : ''}`}>
            <button className="notepad-add-new-note" onClick={handleAddNewItem}>Add New Note</button>
            <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="droppable">
                    {(provided) => (
                        <ul className="notepad-list"
                            {...provided.droppableProps}
                            ref={provided.innerRef}>
                            {items.map((item, index) => (
                                <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                                    {(provided) => (
                                        <li
                                            className={String(visibleDescriptions) === String(item.id) ? 'notepad-active-item' : ''}
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            style={{
                                                userSelect: 'text',
                                                padding: '8px',
                                                margin: '0 0 8px 0',
                                                backgroundColor: '#f4f4f4',
                                                ...provided.draggableProps.style,
                                            }}
                                        >
                                            <p className="notepad-item-date">{item.date}</p>
                                            <div className="notepad-item-move" {...provided.dragHandleProps} style={{cursor: 'grab'}}>
                                                Move Item
                                            </div>
                                            {String(visibleDescriptions) === String(item.id) ? <div><button onClick={() => hideDescription(String(item.id))}>Back to the list</button><button onClick={() => handleSaveItem(item.id)}>Save</button></div> :
                                                <button onClick={() => showDescription(String(item.id))}>Edit</button>}
                                            {confirmRemoveId === item.id ? (
                                                <div className="notepad-modal-remove">
                                                    <div className="notepad-modal-remove__container">
                                                        <p>Confirm remove:</p>
                                                        <button
                                                            onClick={() => {
                                                                hideDescription(String(item.id));
                                                                handleRemoveItem(item.id);
                                                            }}
                                                        >
                                                            Please Remove
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmRemoveId(null)}>Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button onClick={() => handleConfirmRemoveItem(item.id)}>Remove</button>
                                            )}
                                            <input
                                                type="text"
                                                value={item.title}
                                                onChange={(e) => handleTitleChange(e, item.id)}
                                                placeholder="Enter title"
                                                onClick={() => showDescription(String(item.id))} // toggleDescription(String(item.id))}
                                            />

                                            {visibleDescriptions === String(item.id) && (
                                                <textarea
                                                    value={item.description}
                                                    onChange={(e) => handleDescriptionChange(e, item.id)}
                                                    placeholder="Enter description"
                                                ></textarea>
                                            )}

                                        </li>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </ul>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default DragAndDropFormList;
