/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Box, CircularProgress, SxProps, Theme } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as t from "io-ts";
import ErrorModal from "../components/modals/ErrorModal";
import { navigate } from "../utils/navigation";
import {
  addIFrameMessageListener,
  createIFrame,
  start3DS2AcsChallengeStep,
  start3DS2MethodStep
} from "../utils/iframe/iframe";
import {
  getPaymentRequestTask,
  getStringFromSessionStorageTask,
  resumePaymentRequestTask
} from "../utils/transactions/transactionHelpers";
import { vposPgsClient } from "../utils/api/client";
import { getConfigOrThrow } from "../utils/config/config";
import { getToken } from "../utils/navigation";
import {
  CcPaymentInfoAcceptedResponse,
  StatusEnum
} from "../generated/pgs/CcPaymentInfoAcceptedResponse";
import { CcPaymentInfoAuthorizedResponse } from "../generated/pgs/CcPaymentInfoAuthorizedResponse";
import {
  CcPaymentInfoAcsResponse,
  ResponseTypeEnum
} from "../generated/pgs/CcPaymentInfoAcsResponse";

const VposPollingResponse =
  CcPaymentInfoAcceptedResponse ||
  CcPaymentInfoAuthorizedResponse ||
  CcPaymentInfoAcsResponse;

type VposPollingResponse = t.TypeOf<typeof VposPollingResponse>;

const conf = getConfigOrThrow();

const layoutStyle: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  textAlign: "center",
  alignItems: "center"
};

// eslint-disable-next-line functional/no-let
let methodTimeoutEnabled = true;

// eslint-disable-next-line functional/no-let
let isMethodTimeoutElapsed = false;

const handleMethod = (vposUrl: string, methodData: any) => {
  addIFrameMessageListener(handleMethodMessage);
  start3DS2MethodStep(
    vposUrl,
    methodData,
    createIFrame(document.body, "myIdFrame", "myFrameName")
  );
};

const handleChallenge = (vposUrl: string, params: any) => {
  start3DS2AcsChallengeStep(vposUrl, params, document.body);
};

const handleRedirect = (vposUrl: string) => {
  navigate(vposUrl);
};

const handleResponse = (
  resp: VposPollingResponse,
  timeoutDispatcher: React.Dispatch<React.SetStateAction<boolean>> | undefined
) => {
  pipe(
    CcPaymentInfoAcsResponse.decode(resp),
    E.fold(
      (_) => {
        if (
          (resp.status === StatusEnum.AUTHORIZED ||
            resp.status === StatusEnum.DENIED ||
            resp.status === StatusEnum.CANCELLED) &&
          resp.redirectUrl !== undefined
        ) {
          handleRedirect(resp.redirectUrl);
        }
      },
      (acs_resp: CcPaymentInfoAcsResponse) => {
        if (acs_resp.responseType === ResponseTypeEnum.METHOD) {
          sessionStorage.setItem("requestId", resp.requestId);

          if (timeoutDispatcher !== undefined) {
            setTimeout(() => timeoutDispatcher(true), conf.METHOD_STEP_TIMEOUT);
          }

          handleMethod(acs_resp.vposUrl || "", resp.threeDsMethodData);
        } else if (acs_resp.responseType === ResponseTypeEnum.CHALLENGE) {
          handleChallenge(resp.vposUrl || "", { creq: resp.creq });
        }
      }
    )
  );
};

const resumePaymentRequest = (methodCompleted: "Y" | "N") =>
  pipe(
    getStringFromSessionStorageTask("requestId"),
    TE.chain((requestId: string) =>
      pipe(
        getStringFromSessionStorageTask("bearerAuth"),
        TE.chain((bearerAuth: string) => TE.of({ requestId, bearerAuth }))
      )
    ),
    TE.chain(
      ({ requestId, bearerAuth }: { requestId: string; bearerAuth: string }) =>
        pipe(
          resumePaymentRequestTask(methodCompleted, requestId, bearerAuth),
          TE.chain((_) => getPaymentRequestTask(requestId, bearerAuth))
        )
    )
  );

const handleMethodMessage = async (e: MessageEvent<any>) => {
  if (/^react-devtools/gi.test(e.data.source)) {
    return;
  }
  pipe(
    E.fromPredicate(
      (e1: MessageEvent<any>) =>
        e1.origin === conf.API_HOST &&
        e1.data === "3DS.Notification.Received" &&
        !isMethodTimeoutElapsed,
      E.toError
    )(e),
    E.fold(
      (e) => TE.left(e),
      (_) => {
        methodTimeoutEnabled = false;
        return void pipe(
          resumePaymentRequest("Y"),
          TE.fold(
            (e) => TE.left(e),
            // eslint-disable-next-line sonarjs/no-use-of-empty-return-value
            (paymentRequest) => TE.of(handleResponse(paymentRequest, undefined))
          )
        )();
      }
    )
  );
};

export default function Vpos() {
  const { t } = useTranslation();
  const { id } = useParams();
  const bearerAuth = getToken(window.location.href);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [polling, setPolling] = React.useState(true);
  const [methodTimeoutElapsed, setMethodTimeoutElapsed] = React.useState(false);

  const modalTitle = polling ? t("polling.title") : t("errors.title");
  const modalBody = polling ? t("polling.body") : t("errors.body");

  const onError = () => {
    setPolling(false);
    setErrorModalOpen(true);
  };

  const onResponse = (resp: VposPollingResponse) => {
    setPolling(true);
    handleResponse(resp, setMethodTimeoutElapsed);
  };

  React.useEffect(() => {
    sessionStorage.setItem("bearerAuth", bearerAuth);
    void pipe(
      TE.tryCatch(
        () =>
          vposPgsClient.GetVposPaymentRequest({
            bearerAuth,
            requestId: id as string
          }),
        onError // Polling attempt exausted
      ),
      TE.map((response) =>
        pipe(
          response,
          E.map((r) =>
            pipe(
              VposPollingResponse.decode(r.value),
              E.fold(
                (_err) => onError(),
                (r) => onResponse(r)
              )
            )
          )
        )
      )
    )();
  }, []);

  React.useEffect(() => {
    if (methodTimeoutElapsed && methodTimeoutEnabled) {
      isMethodTimeoutElapsed = true;
      void pipe(resumePaymentRequest("N")());
    }
  }, [methodTimeoutElapsed]);

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
