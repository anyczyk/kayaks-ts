import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import Cookies from 'js-cookie';

const itemsList = [
    { id: '1', title: 'Item 1', description: 'Lorem ipsum description 1' },
    { id: '2', title: 'Item 2', description: 'Lorem ipsum description 2' },
    { id: '3', title: 'Item 3', description: 'Lorem ipsum description 3' },
];

// Definicja typu dla elementów listy
type ListItem = {
    id: string;
    title: string;
    description: string;
};

const DragAndDrop: React.FC = () => {
    const [items, setItems] = useState<ListItem[]>([]);
    const [visibleDescriptions, setVisibleDescriptions] = useState<string | null>(null);

    const saveOrderToCookies = (newOrder: ListItem[]) => {
        const orderIds = newOrder.map((item) => item.id);
        Cookies.set('itemOrderOld', JSON.stringify(orderIds), { expires: 7 });
    };

    const loadOrderFromCookies = (): ListItem[] => {
        const savedOrder = Cookies.get('itemOrderOld');
        if (savedOrder) {
            const orderIds = JSON.parse(savedOrder) as string[];
            const reorderedItems = orderIds
                .map((id) => itemsList.find((item) => item.id === id))
                .filter((item): item is ListItem => item !== undefined);
            return reorderedItems;
        }
        return itemsList;
    };

    useEffect(() => {
        setItems(loadOrderFromCookies());
    }, []);

    const handleOnDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const reorderedItems = Array.from(items);
        const [reorderedItem] = reorderedItems.splice(result.source.index, 1);
        reorderedItems.splice(result.destination.index, 0, reorderedItem);

        setItems(reorderedItems);
        saveOrderToCookies(reorderedItems);
    };

    const toggleDescription = (id: string) => {
        setVisibleDescriptions((prevId) => (prevId === id ? null : id));
    };

    return (
        <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="droppable">
                {(provided) => (
                    <ul {...provided.droppableProps} ref={provided.innerRef}>
                        {items.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                                {(provided) => (
                                    <li
                                        className={visibleDescriptions === item.id ? 'notepad-active-item' : ''}
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
                                        <div {...provided.dragHandleProps} style={{ cursor: 'grab' }}>
                                            Move Item
                                        </div>
                                        <h3 onClick={() => toggleDescription(item.id)}>{item.title}</h3>
                                        {visibleDescriptions === item.id && <div>{item.description}</div>}
                                    </li>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </ul>
                )}
            </Droppable>
        </DragDropContext>
    );
};

export default DragAndDrop;