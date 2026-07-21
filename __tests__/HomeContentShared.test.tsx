import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderHighlightedTitle } from '@/components/HomeContent/shared'

describe('renderHighlightedTitle', () => {
  it('highlights text enclosed in asterisks', () => {
    const { container } = render(
      <>{renderHighlightedTitle('Welcome to *Agendain* Travel!', 'base-class', 'highlight-class')}</>
    )
    
    const highlightElement = container.querySelector('.highlight-class')
    expect(highlightElement).toBeInTheDocument()
    expect(highlightElement?.textContent).toBe('Agendain')

    const baseElements = container.querySelectorAll('.base-class')
    expect(baseElements[0].textContent).toBe('Welcome to ')
    expect(baseElements[1].textContent).toBe(' Travel!')
  })

  it('falls back to highlighting the last comma-separated word', () => {
    const { container } = render(
      <>{renderHighlightedTitle('Liburan ke Eropa, Agendain Aja!', 'base-class', 'highlight-class')}</>
    )
    
    const highlightElement = container.querySelector('.highlight-class')
    expect(highlightElement).toBeInTheDocument()
    expect(highlightElement?.textContent).toBe(', Agendain Aja!')
  })
})
