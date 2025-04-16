import React, { useState } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ToolFormProps {
  tool: {
    name: string;
    description: string;
    parameters: any;
  };
  onSubmit: (args: any) => void;
  isSubmitting: boolean;
}

const ToolForm: React.FC<ToolFormProps> = ({
  tool,
  onSubmit,
  isSubmitting,
}) => {
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formValues);
  };

  const handleChange = (
    name: string,
    value: string,
    type: string = 'string'
  ) => {
    let parsedValue: any = value;

    // Try to parse the value based on the type
    if (type === 'number' || type === 'integer') {
      parsedValue = value === '' ? '' : Number(value);
    } else if (type === 'boolean') {
      parsedValue = value === 'true';
    } else if (type === 'object' || type === 'array') {
      try {
        parsedValue = JSON.parse(value);
      } catch (error) {
        // Keep as string if parsing fails
        parsedValue = value;
      }
    }

    setFormValues((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  // Extract parameters from the tool schema
  const parameters = tool.parameters?.properties || {};
  const requiredParams = tool.parameters?.required || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {Object.entries(parameters).map(([name, schema]: [string, any]) => {
        const isRequired = requiredParams.includes(name);
        const type = schema.type || 'string';

        return (
          <div key={name}>
            <label
              htmlFor={name}
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {name}
              {isRequired && (
                <span className="ml-1 text-red-500 dark:text-red-400">*</span>
              )}
            </label>
            <div className="mt-1">
              {type === 'boolean' ? (
                <select
                  id={name}
                  name={name}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  value={formValues[name] === true ? 'true' : 'false'}
                  onChange={(e) =>
                    handleChange(name, e.target.value, 'boolean')
                  }
                  required={isRequired}
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              ) : type === 'object' || type === 'array' ? (
                <textarea
                  id={name}
                  name={name}
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder={`Enter ${type === 'object' ? 'JSON object' : 'JSON array'}`}
                  value={
                    typeof formValues[name] === 'object'
                      ? JSON.stringify(formValues[name], null, 2)
                      : formValues[name] || ''
                  }
                  onChange={(e) => handleChange(name, e.target.value, type)}
                  required={isRequired}
                />
              ) : (
                <input
                  type={type === 'number' || type === 'integer' ? 'number' : 'text'}
                  id={name}
                  name={name}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder={`Enter ${name}`}
                  value={formValues[name] || ''}
                  onChange={(e) => handleChange(name, e.target.value, type)}
                  required={isRequired}
                />
              )}
            </div>
            {schema.description && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {schema.description}
              </p>
            )}
          </div>
        );
      })}

      <div>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <LoadingSpinner size="sm" />
              <span className="ml-2">Executing...</span>
            </div>
          ) : (
            'Execute Tool'
          )}
        </button>
      </div>
    </form>
  );
};

export default ToolForm;
