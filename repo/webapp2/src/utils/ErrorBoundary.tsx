import { ThemeSettingName } from "@fluentui/react";
import React, { ErrorInfo } from "react";

interface Props {
  children: React.ReactNode;
}
interface State {
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }
  static getDerivedStateFromError(error: unknown) {
    // Update state so the next render will show the fallback UI.
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught error", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div>
          <h1>Error</h1>
          <pre>{this.state.error.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
