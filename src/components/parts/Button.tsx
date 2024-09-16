import React, { ReactNode } from 'react';
import styled from 'styled-components';

interface ButtonProps {
    variant?: 'primary' | 'secondary';
    children: ReactNode;
    className?: string; // Dodanie obsługi className
}

const StyledButton = styled.button<ButtonProps>`
    background-color: ${({ variant }) =>
            variant === 'primary' ? '#007bff' : variant === 'secondary' ? '#6c757d' : '#ccc'};
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
        background-color: ${({ variant }) =>
                variant === 'primary' ? '#0056b3' : variant === 'secondary' ? '#5a6268' : '#999'};
    }
`;

const Button: React.FC<ButtonProps> = ({ variant, children, className }) => {
    return (
        <StyledButton variant={variant} className={className}>
            {children}
        </StyledButton>
    );
};

export default Button;