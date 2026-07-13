"use client";

import { Paper, Stack, Typography, Button, Snackbar, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { FormSchema, FormFieldConfig } from "@/types/form";
import { saveFormSubmission } from "@/lib/storage";
import FormFieldComponent from "./FormField";

interface DynamicFormProps {
  schema: FormSchema;
  title?: string;
}

type FormData = Record<string, string>;

function buildDefaultValues(fields: FormFieldConfig[]): FormData {
  const values: FormData = {};
  for (const field of fields) {
    const name = field.name.replace(/\s+/g, "_").toLowerCase();
    values[name] = field.defaultValue ?? "";
  }
  return values;
}

export default function DynamicForm({ schema, title }: DynamicFormProps) {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: buildDefaultValues(schema.data),
    mode: "onBlur",
  });

  const onSubmit = (data: FormData) => {
    saveFormSubmission({ ...data, submittedAt: new Date().toISOString() });
    setSnackbar({
      open: true,
      message: "Form submitted successfully!",
      severity: "success",
    });
  };

  const onError = () => {
    setSnackbar({
      open: true,
      message: "Please fix the errors above.",
      severity: "error",
    });
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, maxWidth: 600, mx: "auto" }}>
      {title && (
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
          {title}
        </Typography>
      )}

      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <Stack spacing={3}>
          {schema.data.map((field) => (
            <FormFieldComponent
              key={field.id}
              field={field}
              control={control}
              errors={errors}
            />
          ))}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ pt: 1 }}>
            <Button type="submit" variant="contained" size="large" fullWidth>
              Submit
            </Button>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={() => reset(buildDefaultValues(schema.data))}
            >
              Reset
            </Button>
          </Stack>
        </Stack>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
