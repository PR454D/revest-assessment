"use client";

import { Container, Box, Typography, Button, Stack } from "@mui/material";
import Link from "next/link";

export default function Home() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, sm: 12 } }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
          Dynamic Form App
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 5 }}>
          Build forms dynamically from JSON schemas with validation, multiple
          field types, and data persistence.
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ justifyContent: "center" }}
        >
          <Link href="/signup" style={{ textDecoration: "none" }}>
            <Button variant="contained" size="large" fullWidth>
              Get Started — Sign Up
            </Button>
          </Link>
        </Stack>

        <Box sx={{ mt: 8 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Features
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            sx={{ mt: 2, justifyContent: "center" }}
          >
            {[
              { title: "Dynamic Fields", desc: "TEXT, LIST, and RADIO field types driven by JSON" },
              { title: "Validation", desc: "Required fields, min/max length — all from schema" },
              { title: "Persistence", desc: "Submissions saved to localStorage automatically" },
            ].map((item) => (
              <Box
                key={item.title}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  flex: 1,
                  maxWidth: 280,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {item.desc}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}
