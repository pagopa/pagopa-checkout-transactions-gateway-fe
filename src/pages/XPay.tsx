/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Box, CircularProgress, SxProps, Theme } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import ErrorModal from "../components/modals/ErrorModal";
import { XPayResponse } from "../models/transactions";
import { GatewayRoutes } from "../routes/routes";
import { transactionFetch, transactionPolling } from "../utils/apiService";
import { getConfigOrThrow } from "../utils/config/config";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";

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
  const config = getConfigOrThrow();
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [polling, setPolling] = React.useState(true);
  const [timeoutId, setTimeoutId] = React.useState<number>();
  const [intervalId, setIntervalId] = React.useState<NodeJS.Timer>();

  const modalTitle = polling ? t("polling.title") : t("errors.title");
  const modalBody = polling ? t("polling.body") : t("errors.body");

  const onError = (_e: string) => {
    setPolling(false);
    setErrorModalOpen(true);
  };

  const overwriteDom = (resp: XPayResponse) => {
    pipe(
      O.fromNullable(resp.html),
      O.map((xpayHtml) => {
        document.write(xpayHtml);
      })
    );
  };

  const onResponse = (resp: XPayResponse) => {
    if (resp.status !== "CREATED") {
      setErrorModalOpen(true);
      setIntervalId(
        transactionPolling(
          `${config.API_HOST}/${config.API_BASEPATH}/${GatewayRoutes.XPAY}/${id}`,
          overwriteDom,
          onError
        )
      );
    } else {
      overwriteDom(resp);
    }
  };

  React.useEffect(() => {
    if (polling && !errorModalOpen) {
      setTimeoutId(
        window.setTimeout(() => {
          setErrorModalOpen(true);
        }, config.API_TIMEOUT)
      );
    } else {
      timeoutId && window.clearTimeout(timeoutId);
      intervalId && clearInterval(intervalId);
    }
  }, [polling, errorModalOpen]);

  React.useEffect(() => {
    transactionFetch(
      `${config.API_HOST}/${config.API_BASEPATH}/${GatewayRoutes.XPAY}/${id}`,
      onResponse,
      onError
    );
  }, []);

  return (
    <Box sx={layoutStyle} aria-live="polite">
      <CircularProgress />
      <ErrorModal
        title={modalTitle}
        body={modalBody}
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
