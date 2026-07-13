"use client";

import {
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Box,
} from "@mui/material";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { FormFieldConfig } from "@/types/form";

interface FormFieldProps {
  field: FormFieldConfig;
  control: Control<Record<string, string>>;
  errors: FieldErrors<Record<string, string>>;
}

function toFieldName(name: string): string {
  return name.replace(/\s+/g, "_").toLowerCase();
}

export default function FormField({ field, control, errors }: FormFieldProps) {
  const fieldName = toFieldName(field.name);
  const error = errors[fieldName];

  switch (field.fieldType) {
    case "TEXT":
      return (
        <Controller
          name={fieldName}
          control={control}
          defaultValue={field.defaultValue ?? ""}
          rules={{
            required: field.required ? `${field.name} is required` : false,
            minLength: field.minLength
              ? {
                  value: field.minLength,
                  message: `Minimum ${field.minLength} character${field.minLength > 1 ? "s" : ""}`,
                }
              : undefined,
            maxLength: field.maxLength
              ? {
                  value: field.maxLength,
                  message: `Maximum ${field.maxLength} characters`,
                }
              : undefined,
          }}
          render={({ field: rhfField }) => (
            <TextField
              {...rhfField}
              label={field.name}
              fullWidth
              variant="outlined"
              error={!!error}
              helperText={error?.message as string}
              required={field.required}
              slotProps={{
                htmlInput: {
                  minLength: field.minLength,
                  maxLength: field.maxLength,
                },
              }}
            />
          )}
        />
      );

    case "LIST":
      return (
        <Controller
          name={fieldName}
          control={control}
          defaultValue={field.defaultValue ?? ""}
          rules={{
            required: field.required ? `${field.name} is required` : false,
          }}
          render={({ field: rhfField }) => (
            <FormControl fullWidth error={!!error} required={field.required}>
              <InputLabel>{field.name}</InputLabel>
              <Select
                {...rhfField}
                label={field.name}
                value={rhfField.value ?? ""}
              >
                {(field.listOfValues ?? []).map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {error && <FormHelperText>{error.message as string}</FormHelperText>}
            </FormControl>
          )}
        />
      );

    case "RADIO":
      return (
        <Controller
          name={fieldName}
          control={control}
          defaultValue={field.defaultValue ?? ""}
          rules={{
            required: field.required ? `${field.name} is required` : false,
          }}
          render={({ field: rhfField }) => (
            <FormControl error={!!error} required={field.required}>
              <FormLabel component="legend">{field.name}</FormLabel>
              <RadioGroup {...rhfField} row>
                {(field.listOfValues ?? []).map((option) => (
                  <FormControlLabel
                    key={option}
                    value={option}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
              {error && <FormHelperText>{error.message as string}</FormHelperText>}
            </FormControl>
          )}
        />
      );

    default:
      return (
        <Box>
          Unsupported field type: {(field as FormFieldConfig).fieldType}
        </Box>
      );
  }
}
