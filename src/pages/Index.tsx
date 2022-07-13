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
import ErrorModal from "../components/modals/ErrorModal";
import { Channel, PollingResponseEntity } from "../models/transactions";
import { transactionFetch, transactionPolling } from "../utils/apiService";
import { getConfig } from "../utils/config";
import {
  getCurrentLocation,
  getQueryParam,
  navigate
} from "../utils/navigation";

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

  const onError = (_e: string) => {
    setErrorModalOpen(true);
  };

  React.useEffect(() => {
    transactionFetch(
      `${getConfig().API_HOST}/${
        getConfig().API_BASEPATH
      }/request-payments/${paymentGateway}/${requestId}`,
      setInfo,
      onError
    );
    transactionPolling(
      `${getConfig().API_HOST}/${
        getConfig().API_BASEPATH
      }/request-payments/${paymentGateway}/${requestId}`,
      setInfo,
      onError
    );
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
    info?.authOutcome && navigate(info?.clientResponseUrl);
  }, [info]);

  const handleClick = React.useCallback(() => {
    info?.urlRedirect &&
      navigate(`${getCurrentLocation()}&urlRedirect=${info?.urlRedirect}`);
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
          {!loading && (
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
        open={errorModalOpen}
        onClose={() => {
          setErrorModalOpen(false);
        }}
      />
    </Box>
  );
}
