import { ThemeProvider, createTheme } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "@pagopa/mui-italia";
import React from "react";
import { Container } from "@mui/material";
import { Box } from "@mui/system";

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
            pl: { xs: 2, sm: 6, md: 0 },
            pr: { xs: 2, sm: 6, md: 0 },
            flexGrow: 1,
          }}
          maxWidth={"sm"}
        >
          <h1>App</h1>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
