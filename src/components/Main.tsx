import React from 'react';
import Button from './Button';
import useWindowSize from '../hooks/useWindowSize';

const showModal = () => {
    alert('hello');
};

const Main: React.FC = () => {
    const { width, height } = useWindowSize();

    return (
        <>
            <main><p>Main Component</p></main>
            <Button className="myExtraClass1 myExtraClass2" variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button>Default Button</Button>
            <button onClick={showModal}>Click</button>
            <div>
                <h2>Window Size X Y</h2>
                <p>Width: {width}px</p>
                <p>Height: {height}px</p>
            </div>
        </>
    );
};

export default Main;