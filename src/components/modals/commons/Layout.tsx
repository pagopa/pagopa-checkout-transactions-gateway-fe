import { Box, Container, useTheme } from "@mui/material";
import * as React from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100vh",
        bgcolor: theme.palette.background.default
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
          justifyContent: "center"
        }}
        maxWidth={"xs"}
      >
        {children}
      </Container>
    </Box>
  );
}
