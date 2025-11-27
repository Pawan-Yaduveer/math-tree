import { useState } from 'react';
import type { FormEvent } from 'react';
import type { OperationType } from '../types';

interface OperationFormProps {
  mode: 'start' | 'reply';
  title: string;
  onSubmit: (payload: { value?: number; operation?: OperationType; inputNumber?: number }) => Promise<void>;
  disabled?: boolean;
}

const operationOptions: { value: OperationType; label: string }[] = [
  { value: 'add', label: 'Add' },
  { value: 'subtract', label: 'Subtract' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'divide', label: 'Divide' },
];

const OperationForm = ({ mode, title, onSubmit, disabled }: OperationFormProps) => {
  const [value, setValue] = useState('');
  const [operation, setOperation] = useState<OperationType>('add');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
      setError('Enter a valid number');
      return;
    }

    try {
      if (mode === 'start') {
        await onSubmit({ value: numericValue });
      } else {
        await onSubmit({ operation, inputNumber: numericValue });
      }
      setValue('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit');
    }
  };

  return (
    <form className="operation-form" onSubmit={handleSubmit}>
      <h3>{title}</h3>
      {mode === 'reply' && (
        <label>
          <span>Operation</span>
          <select value={operation} onChange={(e) => setOperation(e.target.value as OperationType)}>
            {operationOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
      )}
      <label>
        <span>{mode === 'start' ? 'Starting value' : 'Right operand'}</span>
        <input type="number" value={value} onChange={(e) => setValue(e.target.value)} />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit" className="primary" disabled={disabled}>{disabled ? 'Please wait…' : 'Publish'}</button>
    </form>
  );
};

export default OperationForm;
