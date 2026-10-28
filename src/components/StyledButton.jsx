/**
 * CareBridge — Isolated styled-components Demonstration Component
 * File: src/components/StyledButton.jsx
 * Reference: PDF Page 16 (Task 07 Styling Showcase)
 */

import styled from 'styled-components';

export const StyledButton = styled.button`
  background: ${props => props.primary ? '#0284c7' : '#64748b'};
  color: #ffffff;
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.1s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 3px solid #38bdf8;
    outline-offset: 2px;
  }
`;

export default StyledButton;
