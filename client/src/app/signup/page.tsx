"use client";

import { Container, Box, Typography } from "@mui/material";
import { DynamicForm } from "@/components/DynamicForm";
import { signupFormSchema } from "@/data/signupFormSchema";
import Link from "next/link";

export default function SignupPage() {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 3, sm: 6 } }}>
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Sign Up
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create your account by filling out the form below.
        </Typography>
      </Box>

      <DynamicForm schema={signupFormSchema} />

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Link href="/" style={{ color: "#1976d2", textDecoration: "none" }}>
          ← Back to Home
        </Link>
      </Box>
    </Container>
  );
}
