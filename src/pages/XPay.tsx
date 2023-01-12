import { Box, CircularProgress, SxProps, Theme } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import ErrorModal from "../components/modals/ErrorModal";
import { XPayResponse } from "../models/transactions";
import { GatewayRoutes } from "../routes/routes";
import { transactionFetch, transactionPolling } from "../utils/apiService";
import { getConfig } from "../utils/config";

const layoutStyle: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  textAlign: "center",
  alignItems: "center"
};
export default function XPay() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [polling, setPolling] = React.useState(false);

  const onError = (_e: string) => {
    setPolling(false);
    setErrorModalOpen(true);
  };

  const overwriteDom = (resp: XPayResponse) => {
    if (resp.html) {
      document.open("text/html");
      document.write("<!DOCTYPE HTML>" + resp.html);
      document.close();
    }
  };

  const onResponse = (resp: XPayResponse) => {
    if (resp.status !== "CREATED") {
      setPolling(true);
      setErrorModalOpen(true);
      transactionPolling(
        `${getConfig().API_HOST}/${getConfig().API_BASEPATH}/request-payments/${
          GatewayRoutes.XPAY
        }/${id}`,
        overwriteDom,
        onError
      );
    } else {
      overwriteDom(resp);
    }
  };

  React.useEffect(() => {
    transactionFetch(
      `${getConfig().API_HOST}/${getConfig().API_BASEPATH}/request-payments/${
        GatewayRoutes.XPAY
      }/${id}`,
      onResponse,
      onError
    );
  }, []);

  return (
    <Box sx={layoutStyle} aria-live="polite">
      <CircularProgress />
      <ErrorModal
        title={t("polling.title")}
        body={t("polling.body")}
        progress={polling}
        open={errorModalOpen}
        onClose={() => {
          if (!polling) {
            setErrorModalOpen(false);
          }
        }}
      />
    </Box>
  );
}
