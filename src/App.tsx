import { createTheme, ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "@pagopa/mui-italia";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/modals/commons/Layout";
import XPay from "./pages/XPay";
import { GatewayRoutes, GatewayRoutesBasePath } from "./routes/routes";
import "./translations/i18n";
import Vpos from "./pages/Vpos";

export function App() {
  const transactionsTheme = createTheme({ ...theme });
  return (
    <ThemeProvider theme={transactionsTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route
              path={`/${GatewayRoutesBasePath}/${GatewayRoutes.XPAY}/:id`}
              element={<XPay />}
            />
            <Route
              path={`/${GatewayRoutesBasePath}/${GatewayRoutes.VPOS}/:id`}
              element={<Vpos />}
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
