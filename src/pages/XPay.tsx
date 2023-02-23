/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Box, CircularProgress, SxProps, Theme } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import ErrorModal from "../components/modals/ErrorModal";
import { pgsXPAYClient } from "../utils/api/client";
import { getToken } from "../utils/navigation";
import {
  StatusEnum,
  XPayPollingResponseEntity
} from "../generated/pgs/XPayPollingResponseEntity";
import { navigate } from "../utils/navigation";

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
  const bearerAuth = getToken(window.location.href);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [polling, setPolling] = React.useState(true);

  const modalTitle = polling ? t("polling.title") : t("errors.title");
  const modalBody = polling ? t("polling.body") : t("errors.body");

  const onError = () => {
    setPolling(false);
    setErrorModalOpen(true);
  };

  const overwriteDom = (resp: XPayPollingResponseEntity) => {
    if (resp.html) {
      document.open("text/html");
      document.write(`<!DOCTYPE HTML> ${resp.html}`);
      document.close();
    }
  };

  const isFinalStatus = (status: StatusEnum) =>
    status === StatusEnum.AUTHORIZED || status === StatusEnum.DENIED;

  const handleRedirect = (redirectUrl: string) => navigate(redirectUrl);

  const handleXPayResponse = (resp: XPayPollingResponseEntity) => {
    if (resp.status === StatusEnum.CREATED) {
      overwriteDom(resp);
    } else if (isFinalStatus(resp.status) && resp.redirectUrl !== undefined) {
      handleRedirect(resp.redirectUrl);
    }
  };

  React.useEffect(() => {
    sessionStorage.setItem("bearerAuth", bearerAuth);
    void pipe(
      TE.tryCatch(
        () =>
          pgsXPAYClient.GetXpayPaymentRequest({
            bearerAuth,
            requestId: id as string
          }),
        onError
      ),
      TE.map((errorOrResp) => {
        pipe(
          errorOrResp,
          E.map((r) =>
            pipe(
              XPayPollingResponseEntity.decode(r.value),
              E.fold(
                (_err) => onError(),
                (r) => {
                  setPolling(false);
                  handleXPayResponse(r);
                }
              )
            )
          )
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
