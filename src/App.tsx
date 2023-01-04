import { createTheme, ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "@pagopa/mui-italia";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/modals/commons/Layout";
import Postepay from "./pages/Postepay";
import XPay from "./pages/XPay";
import { GatewayRoutes } from "./routes/routes";
import "./translations/i18n";

export function App() {
  const transactionsTheme = createTheme({ ...theme });
  return (
    <ThemeProvider theme={transactionsTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path={"/" + GatewayRoutes.POSTEPAY} element={<Postepay />} />
            <Route
              path={"/" + GatewayRoutes.XPAY + "/:id"}
              element={<XPay />}
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
