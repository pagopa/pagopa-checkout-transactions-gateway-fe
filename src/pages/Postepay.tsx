/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";
import {
  Box,
  Button,
  CircularProgress,
  SxProps,
  Theme,
  Typography
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import ErrorModal from "../components/modals/ErrorModal";
import { Channel } from "../models/transactions";
import {
  getCurrentLocation,
  getQueryParam,
  navigate
} from "../utils/navigation";
import { postepayPgsClient } from "../utils/api/client";
import { PollingResponseEntity } from "../generated/pgs/PollingResponseEntity";

const layoutStyle: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  textAlign: "center",
  alignItems: "center"
};
export default function Index() {
  const { t } = useTranslation();
  const [info, setInfo] = React.useState<PollingResponseEntity>();
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [loading] = React.useState<boolean>(!!getQueryParam("urlRedirect"));

  const requestId = getQueryParam("requestId");
  const paymentGateway = getQueryParam("paymentGateway") || "postepay";
  const i18nInterpolation = {
    appName: `${paymentGateway.charAt(0).toUpperCase()}${paymentGateway.slice(
      1
    )}`
  };
  const i18nTitle = loading ? "index.loadingTitle" : "index.title";
  const i18nBody = loading ? "index.loadingBody" : "index.body";

  const onError = () => {
    setErrorModalOpen(true);
  };

  React.useEffect(() => {
    void pipe(
      TE.tryCatch(
        () =>
          postepayPgsClient.GetPostepayPaymentRequest({
            requestId: requestId as string
          }),
        () => onError()
      ),
      TE.map((errorOrResponse) =>
        pipe(
          errorOrResponse,
          E.map((response) => setInfo(response.value))
        )
      )
    )();
  }, []);

  React.useEffect(() => {
    if (info?.urlRedirect && info.channel === Channel.WEB) {
      navigate(info.urlRedirect);
    }
    if (
      info?.urlRedirect &&
      info.channel === Channel.APP &&
      !getQueryParam("urlRedirect")
    ) {
      navigate(`${getCurrentLocation()}&urlRedirect=${info?.urlRedirect}`);
    }
    info?.authOutcome && navigate(info?.clientResponseUrl || "");
  }, [info]);

  const handleClick = React.useCallback(() => {
    info?.urlRedirect && window.open(info?.urlRedirect, "_blank")?.focus();
  }, [info]);

  return (
    <Box sx={layoutStyle} aria-live="polite">
      {info ? (
        <>
          {loading ? (
            <CircularProgress />
          ) : info?.logoResourcePath ? (
            <img
              src={info?.logoResourcePath}
              alt="Logo gestore"
              style={{ width: "59px", height: "59px" }}
            />
          ) : (
            <ImageNotSupportedIcon sx={{ width: "59px", height: "59px" }} />
          )}
          <Typography variant="h5" component="div" mt={6}>
            {t(i18nTitle, i18nInterpolation)}
          </Typography>
          <Typography variant="body1" component="div" my={2}>
            {t(i18nBody, i18nInterpolation)}
          </Typography>
          {loading && (
            <Button
              id="gateway-submit"
              type="button"
              onClick={handleClick}
              variant="outlined"
              sx={{
                width: "100%",
                height: "100%",
                minHeight: 45
              }}
            >
              {t("index.submit", i18nInterpolation)}
            </Button>
          )}
        </>
      ) : (
        <CircularProgress />
      )}
      <ErrorModal
        title={t("errors.title")}
        body={t("errors.body")}
        open={errorModalOpen}
        onClose={() => {
          setErrorModalOpen(false);
        }}
      />
    </Box>
  );
}
