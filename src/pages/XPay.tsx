/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Box, CircularProgress, SxProps, Theme } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import ErrorModal from "../components/modals/ErrorModal";
import { XPayResponse } from "../models/transactions";
import { pgsXPAYClient } from "../utils/api/client";

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
  const [polling, setPolling] = React.useState(true);

  const modalTitle = polling ? t("polling.title") : t("errors.title");
  const modalBody = polling ? t("polling.body") : t("errors.body");

  const onError = () => {
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

  React.useEffect(() => {
    void pipe(
      TE.tryCatch(
        () =>
          pgsXPAYClient.GetXpayPaymentRequest({
            requestId: id as string
          }),
        () => onError()
      ),
      TE.map((errorOrResp) => {
        pipe(
          errorOrResp,
          E.map((r) => {
            setPolling(false);
            overwriteDom(r.value as XPayResponse);
          })
        );
      })
    )();
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
