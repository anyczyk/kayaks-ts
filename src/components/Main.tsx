import React, { useState, useEffect } from 'react';
import Button from './parts/Button';
import useWindowSize from '../hooks/useWindowSize';
import Homepage from './subpages/homepage';
import About from './subpages/about';
import Contact from './subpages/contact';
import Notepad from "./subpages/notepad";
import NotepadSave from "./subpages/notepadSave";
import NotepadSaveLanguage from "./subpages/notepadSaveLanguage";

const showModal = () => {
    alert('hello');
};

const Main: React.FC = () => {
    const { width, height } = useWindowSize();
    const [activePage, setActivePage] = useState<string>(() => {
        // Determine initial page based on the URL path
        const path = window.location.pathname;
        if (path === '/about') return 'about';
        if (path === '/contact') return 'contact';
        if (path === '/notepad') return 'notepad';
        if (path === '/notepadSave') return 'notepadSave';
        if (path === '/notepadsavelanguage') return 'notepadsavelanguage';
        return ''; // Default to Homepage
    });

    // Function to update the URL and state when a page is loaded
    const updatePage = (page: string, url: string) => {
        setActivePage(page);
        window.history.pushState({ page }, '', url);
    };

    // Handlers to set the active page
    const loadHomepage = () => updatePage('', '/');

    const loadAbout = () => updatePage('about', '/about');

    const loadContact = () => updatePage('contact', '/contact');

    const loadNotepad = () => updatePage('notepad', '/notepad');

    const loadNotepadSave = () => updatePage('notepadSave', '/notepadSave');

    const loadNotepadSaveLanguage = () => updatePage('notepadsavelanguage', '/notepadsavelanguage');


    // Effect to handle back/forward navigation using the popstate event
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            const path = window.location.pathname;
            if (path === '/about') setActivePage('about');
            else if (path === '/contact') setActivePage('contact');
            else setActivePage(''); // Default to Homepage
        };

        window.addEventListener('popstate', handlePopState);

        // Cleanup event listener on component unmount
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    return (
        <>
            <nav>
                <ul>
                    <li>
                        <button onClick={loadHomepage}>Home</button>
                    </li>
                    <li>
                        <button onClick={loadAbout}>About</button>
                    </li>
                    <li>
                        <button onClick={loadContact}>Contact</button>
                    </li>
                    <li>
                        <button onClick={loadNotepad}>Notepad</button>
                    </li>
                    <li>
                        <button onClick={loadNotepadSave}>Notepad Save</button>
                    </li>
                    <li>
                        <button onClick={loadNotepadSaveLanguage}>Notepad Save Language</button>
                    </li>
                </ul>
            </nav>
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
            <div>
                {/* Conditionally render About or Contact based on the activePage state */}
                {activePage === 'about' && <About />}
                {activePage === 'contact' && <Contact />}
                {activePage === 'notepad' && <Notepad />}
                {activePage === 'notepadSave' && <NotepadSave />}
                {activePage === 'notepadsavelanguage' && <NotepadSaveLanguage />}
                {activePage === '' && <Homepage />}
            </div>
            <div>
                {/*<DragAndDrop itemsList={initialItems} />*/}
            </div>
        </>
    );
};

export default Main;