import React from 'react';
import DragAndDropFormList from "../parts/DragAndDropFormList";

const NotePadSave: React.FC = () => {
    return (
        <div className="notepade-save-container">
            <h2>NotePad Save</h2>
            <DragAndDropFormList />
        </div>
    );
};

export default NotePadSave;