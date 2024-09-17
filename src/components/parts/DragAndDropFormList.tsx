import React, { useState, useEffect, ChangeEvent } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import Cookies from 'js-cookie';
import { translations } from '../elements/notepadSaveTranslations';

interface FormData {
    id: number;
    title: string;
    description: string;
    date: string;
}

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

const saveData = async (data: FormData): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction('formData', 'readwrite');
    const store = transaction.objectStore('formData');
    store.put(data);
};

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
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    const language: string = Cookies.get('notepadSaveLanguage') || 'en';
    const currentTranslations = translations[language] || translations.en;

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
            date: new Date().toLocaleString('pl-PL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }),
        };
        setItems((prevItems) => [newItem, ...prevItems]);
        setVisibleDescriptions(String(newItem.id));
        setIsDescriptionVisible(true);
    };

    const handleTitleChange = (e: ChangeEvent<HTMLInputElement>, id: number) => {
        const newTitle = e.target.value;
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, title: newTitle } : item
            )
        );

        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        const newTimeoutId = setTimeout(() => {
            document.getElementById(`save-button-${id}`)?.click();
        }, 1000);

        setTimeoutId(newTimeoutId);
    };

    const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>, id: number) => {
        const newDescription = e.target.value;
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, description: newDescription } : item
            )
        );

        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        const newTimeoutId = setTimeout(() => {
            document.getElementById(`save-button-${id}`)?.click();
        }, 1000);

        setTimeoutId(newTimeoutId);
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
            await saveData(itemToSave);
            saveOrderToCookies(updatedItems);
        }
    };

    const handleRemoveItem = async (id: number) => {
        await deleteData(id);
        setItems((prevItems) => {
            const updatedItems = prevItems.filter((item) => item.id !== id);
            saveOrderToCookies(updatedItems);
            return updatedItems;
        });
        setConfirmRemoveId(null);
    };

    const toggleDescription = (id: string) => {
        setVisibleDescriptions((prevId) => (prevId === id ? null : id));
    };

    const showDescription = (id: string) => {
        setVisibleDescriptions(id);
        setIsDescriptionVisible(true);
    };

    const hideDescription = (id: string) => {
        setVisibleDescriptions(null);
        setIsDescriptionVisible(false);
    };

    const handleConfirmRemoveItem = (id: number) => {
        setConfirmRemoveId(id);
    };

    return (
        <div className={`notepad ${isDescriptionVisible ? 'notepad-single' : ''}`}>
            <button className="notepad-add-new-note" onClick={handleAddNewItem}>
                {currentTranslations.addNewNote}
            </button>
            <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="droppable">
                    {(provided) => (
                        <ul
                            className="notepad-list"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {items.map((item, index) => (
                                <Draggable
                                    key={item.id}
                                    draggableId={item.id.toString()}
                                    index={index}
                                >
                                    {(provided) => (
                                        <li
                                            className={
                                                String(visibleDescriptions) === String(item.id)
                                                    ? 'notepad-active-item'
                                                    : ''
                                            }
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
                                            <div
                                                className="notepad-item-move"
                                                {...provided.dragHandleProps}
                                                style={{ cursor: 'grab' }}
                                            >
                                                {currentTranslations.move}
                                            </div>
                                            {String(visibleDescriptions) === String(item.id) ? (
                                                <div>
                                                    <button
                                                        onClick={() =>
                                                            hideDescription(String(item.id))
                                                        }
                                                    >
                                                        {
                                                            currentTranslations.returnToNotesList
                                                        }
                                                    </button>
                                                    <button
                                                        id={`save-button-${item.id}`}
                                                        onClick={() => handleSaveItem(item.id)}
                                                    >
                                                        {currentTranslations.save}
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        showDescription(String(item.id))
                                                    }
                                                >
                                                    {currentTranslations.edit}
                                                </button>
                                            )}
                                            {confirmRemoveId === item.id ? (
                                                <div className="notepad-modal-remove">
                                                    <div className="notepad-modal-remove__container">
                                                        <p>
                                                            {
                                                                currentTranslations.confirmNoteDeletion
                                                            }
                                                        </p>
                                                        <button
                                                            onClick={() => {
                                                                hideDescription(
                                                                    String(item.id)
                                                                );
                                                                handleRemoveItem(item.id);
                                                            }}
                                                        >
                                                            {currentTranslations.pleaseRemove}
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                setConfirmRemoveId(null)
                                                            }
                                                        >
                                                            {currentTranslations.cancel}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        handleConfirmRemoveItem(item.id)
                                                    }
                                                >
                                                    {currentTranslations.remove}
                                                </button>
                                            )}
                                            <input
                                                type="text"
                                                value={item.title}
                                                onChange={(e) =>
                                                    handleTitleChange(e, item.id)
                                                }
                                                placeholder="Enter title"
                                                onClick={() =>
                                                    showDescription(String(item.id))
                                                }
                                            />

                                            {visibleDescriptions === String(item.id) && (
                                                <textarea
                                                    value={item.description}
                                                    onChange={(e) =>
                                                        handleDescriptionChange(e, item.id)
                                                    }
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
