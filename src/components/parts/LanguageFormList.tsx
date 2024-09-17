// LanguageFormList.tsx
import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { translations } from '../elements/notepadSaveTranslations'; //

const LanguageFormList: React.FC = () => {
    const [language, setLanguage] = useState(Cookies.get('notepadSaveLanguage') || 'en');

    const currentTranslations = translations[language] || translations.en;

    const languageNames: Record<string, string> = {
        en: 'English',
        pl: 'Polski',
        id: 'Bahasa Indonesia',
    };

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLanguage = event.target.value;
        setLanguage(selectedLanguage);
        Cookies.set('notepadSaveLanguage', selectedLanguage, { expires: 365 * 20 });
    };

    return (
        <>
            <h3>{currentTranslations.welcomeMessage}</h3>
            <p>
                {currentTranslations.currentLanguage}: <strong>{languageNames[language]}</strong>
            </p>
            <select value={language} onChange={handleLanguageChange}>
                <option value="en">English</option>
                <option value="pl">Polski</option>
                <option value="id">Bahasa Indonesia</option>
            </select>
        </>
    );
};

export default LanguageFormList;
