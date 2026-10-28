/**
 * CareBridge — Isolated CSS-in-JS Example with styled-components
 * File: src/examples/StyledComponentsShowcase.jsx
 * 
 * Demonstrates:
 * - Basic usage of the `styled` API
 * - Dynamic styling based on component props ($priority, $variant, $size)
 * - Contrast with CSS Modules (styles co-located in JS, runtime generation)
 */

import React, { useState } from 'react';
import styled, { css } from 'styled-components';

// 1. Dynamic Styled Badge based on triage priority prop
export const StyledTriageBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  transition: all 0.2s ease;

  ${(props) =>
    props.$priority === 'urgent' &&
    css`
      background-color: #fee2e2;
      color: #991b1b;
      border: 1px solid #fecaca;
    `}

  ${(props) =>
    props.$priority === 'priority' &&
    css`
      background-color: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    `}

  ${(props) =>
    (props.$priority === 'routine' || !props.$priority) &&
    css`
      background-color: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    `}
`;

// 2. Dynamic Action Button with size and variant props
export const StyledClinicalButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: inherit;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s ease-in-out;

  padding: ${(props) => (props.$size === 'sm' ? '0.35rem 0.75rem' : '0.6rem 1.25rem')};
  font-size: ${(props) => (props.$size === 'sm' ? '0.75rem' : '0.875rem')};

  ${(props) =>
    props.$variant === 'primary' &&
    css`
      background-color: #0284c7;
      color: #ffffff;
      &:hover {
        background-color: #0369a1;
      }
    `}

  ${(props) =>
    props.$variant === 'emergency' &&
    css`
      background-color: #dc2626;
      color: #ffffff;
      &:hover {
        background-color: #b91c1c;
      }
    `}

  ${(props) =>
    props.$variant === 'outline' &&
    css`
      background-color: transparent;
      border-color: #cbd5e1;
      color: #334155;
      &:hover {
        background-color: #f1f5f9;
        color: #0f172a;
      }
    `}

  &:focus-visible {
    outline: 2px solid #0284c7;
    outline-offset: 2px;
  }
`;

// 3. Isolated Showcase Component (Kept separate from primary clinical portal)
export function StyledComponentsShowcase() {
  const [priority, setPriority] = useState('urgent');

  return (
    <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <h3 style={{ margin: '0 0 1rem 0' }}>styled-components Showcase (CSS-in-JS)</h3>
      <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
        This isolated component demonstrates dynamic props and scoped CSS-in-JS styles.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
        <StyledTriageBadge $priority={priority}>
          ● {priority} Triage Tier
        </StyledTriageBadge>
        
        <StyledClinicalButton
          $variant="outline"
          $size="sm"
          onClick={() => setPriority(priority === 'urgent' ? 'priority' : priority === 'priority' ? 'routine' : 'urgent')}
        >
          Toggle Dynamic Priority
        </StyledClinicalButton>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <StyledClinicalButton $variant="primary" $size="sm">Primary Action</StyledClinicalButton>
        <StyledClinicalButton $variant="emergency" $size="sm">Emergency Code</StyledClinicalButton>
        <StyledClinicalButton $variant="outline" $size="sm">Dismiss</StyledClinicalButton>
      </div>
    </div>
  );
}

export default StyledComponentsShowcase;
