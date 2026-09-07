declare module 'react-quill' {
  import * as React from 'react';
  
  export interface ReactQuillProps {
    value?: string;
    defaultValue?: string;
    readOnly?: boolean;
    theme?: string;
    modules?: any;
    formats?: string[];
    bounds?: string | HTMLElement;
    placeholder?: string;
    tabIndex?: number;
    onChange?: (content: string, delta: any, source: any, editor: any) => void;
    onChangeSelection?: (selection: any, source: any, editor: any) => void;
    onFocus?: (selection: any, source: any, editor: any) => void;
    onBlur?: (previousSelection: any, source: any, editor: any) => void;
    onKeyDown?: React.EventHandler<any>;
    onKeyPress?: React.EventHandler<any>;
    onKeyUp?: React.EventHandler<any>;
    className?: string;
    style?: React.CSSProperties;
    id?: string;
  }

  export default class ReactQuill extends React.Component<ReactQuillProps> {
    focus(): void;
    blur(): void;
    getEditor(): any;
  }
}
