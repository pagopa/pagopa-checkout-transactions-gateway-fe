import { Container, createTheme, ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/system";
import { theme } from "@pagopa/mui-italia";
import React from "react";
import Index from "./pages/Index";
import "./translations/i18n";

export function App() {
  const transactionsTheme = createTheme({ ...theme });
  return (
    <ThemeProvider theme={transactionsTheme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100vh",
          bgcolor: theme.palette.background.default,
        }}
      >
        <Container
          sx={{
            p: { xs: 0 },
            pl: { xs: 7, sm: 6, md: 0 },
            pr: { xs: 7, sm: 6, md: 0 },
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
          maxWidth={"xs"}
        >
          <Index />
        </Container>
      </Box>
    </ThemeProvider>
  );
}
