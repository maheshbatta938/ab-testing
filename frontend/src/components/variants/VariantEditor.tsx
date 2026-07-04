import { Card } from "../ui/Card";

export interface EditableVariant {
  name: string;
  htmlContent: string;
  cssContent: string;
}

interface VariantEditorProps {
  variant: EditableVariant;
  index: number;
  onChange: (index: number, field: keyof EditableVariant, value: string) => void;
}

export function VariantEditor({ variant, index, onChange }: VariantEditorProps) {
  return (
    <Card className="variant-editor-card">
      <div className="card-header">
        <h3>Variant {index + 1}</h3>
        <input
          value={variant.name}
          onChange={(event) => onChange(index, "name", event.target.value)}
          placeholder={`Variant ${String.fromCharCode(65 + index)}`}
        />
      </div>
      <label>
        HTML content
        <textarea
          rows={8}
          value={variant.htmlContent}
          onChange={(event) => onChange(index, "htmlContent", event.target.value)}
          placeholder="<section><h1>Headline</h1><button>Click me</button></section>"
        />
      </label>
      <label>
        CSS styling
        <textarea
          rows={8}
          value={variant.cssContent}
          onChange={(event) => onChange(index, "cssContent", event.target.value)}
          placeholder=".hero { padding: 32px; background: #eff6ff; }"
        />
      </label>
    </Card>
  );
}
