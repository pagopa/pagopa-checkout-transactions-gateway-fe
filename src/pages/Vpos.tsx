/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Box, CircularProgress, SxProps, Theme } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import ErrorModal from "../components/modals/ErrorModal";
import { GatewayRoutes } from "../routes/routes";
import { transactionFetch, transactionPolling } from "../utils/apiService";
import { getConfig } from "../utils/config";
import { CcPaymentInfoAcceptedResponse } from "../generated/pgs/CcPaymentInfoAcceptedResponse";
import { CcPaymentInfoAcsResponse } from "../generated/pgs/CcPaymentInfoAcsResponse";
import { navigate } from "../utils/navigation";
import {
  createIFrame,
  start3DS2AcsChallengeStep,
  start3DS2MethodStep
} from "../utils/iframe/iframe";

const layoutStyle: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  textAlign: "center",
  alignItems: "center"
};
export default function Vpos() {
  const { t } = useTranslation();
  const { id } = useParams();
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

  const handleMethod = (vposUrl: string, methodData: any) => {
    start3DS2MethodStep(
      vposUrl,
      methodData,
      createIFrame(document.body, "myIdFrame", "myFrameName")
    );
  };

  const handleChallenge = (vposUrl: string, params: any) =>
    start3DS2AcsChallengeStep(vposUrl, params, document.body);

  const handleRedirect = (vposUrl: string) => {
    navigate(vposUrl);
  };

  const onResponse = (
    resp: CcPaymentInfoAcceptedResponse | CcPaymentInfoAcsResponse
  ) => {
    if (
      resp.status === "CREATED" &&
      resp.vposUrl !== undefined &&
      resp.responseType === "method"
    ) {
      handleMethod(resp.vposUrl, null);
    } else if (
      resp.status === "CREATED" &&
      resp.vposUrl !== undefined &&
      resp.responseType === "challenge"
    ) {
      handleChallenge(resp.vposUrl, null);
    } else if (
      (resp.status === "AUTHORIZED" || resp.status === "DENIED") &&
      resp.vposUrl !== undefined
    ) {
      handleRedirect(resp.vposUrl);
    }
  };

  React.useEffect(() => {
    if (polling && !errorModalOpen) {
      setTimeoutId(
        window.setTimeout(() => {
          setErrorModalOpen(true);
        }, getConfig().API_TIMEOUT)
      );
    } else {
      timeoutId && window.clearTimeout(timeoutId);
      intervalId && clearInterval(intervalId);
    }
  }, [polling, errorModalOpen]);

  React.useEffect(() => {
    transactionFetch(
      `${getConfig().API_HOST}/request-payments/${GatewayRoutes.VPOS}/${id}`,
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
