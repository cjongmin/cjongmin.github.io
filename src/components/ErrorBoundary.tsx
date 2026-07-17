import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Catches render errors in any section so one broken component
 * (e.g. malformed JSON data) can't blank the whole page.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('Render error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 text-center px-6">
          <p className="text-secondary text-sm">
            Something went wrong while rendering this page.
          </p>
          <button onClick={() => window.location.reload()} className="btn-secondary">
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
