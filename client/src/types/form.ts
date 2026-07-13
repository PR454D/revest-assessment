export type FieldType = "TEXT" | "LIST" | "RADIO";

export interface FormFieldConfig {
  id: number;
  name: string;
  fieldType: FieldType;
  minLength?: number;
  maxLength?: number;
  defaultValue?: string;
  required: boolean;
  listOfValues?: string[];
}

export interface FormSchema {
  data: FormFieldConfig[];
}
