import React from 'react';
import DragAndDrop from "../parts/DragAndDrop";
import MyForm from "../parts/MyForm";

const Notepad: React.FC = () => {

    return (
        <>
            <h2>Notepad</h2>
            <MyForm />
            <DragAndDrop />
        </>
    );
};

export default Notepad;