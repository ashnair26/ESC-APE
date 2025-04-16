import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface JsonViewProps {
  data: any;
  className?: string;
}

const JsonView: React.FC<JsonViewProps> = ({ data, className }) => {
  const jsonString = JSON.stringify(data, null, 2);

  return (
    <div className={className}>
      <SyntaxHighlighter
        language="json"
        style={tomorrow}
        customStyle={{
          margin: 0,
          padding: '1rem',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          lineHeight: '1.25rem',
        }}
      >
        {jsonString}
      </SyntaxHighlighter>
    </div>
  );
};

export default JsonView;
