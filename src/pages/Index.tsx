/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
import { Channel, PollingResponseEntity } from "../models/transactions";
import { transactionFetch, transactionPolling } from "../utils/apiService";
import { getConfig } from "../utils/config";
import {
  getCurrentLocation,
  getRequestId,
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
  const [loading] = React.useState<boolean>(
    getCurrentLocation().includes("?urlRedirect=")
  );

  const requestId = getRequestId();
  const i18nInterpolation = { appName: "Postepay" };
  const i18nTitle = loading ? "index.loadingTitle" : "index.title";
  const i18nBody = loading ? "index.loadingBody" : "index.body";

  const onError = (e: string) => {
    //  TO DO Error handling
    // eslint-disable-next-line no-console
    console.log(e);
  };

  React.useEffect(() => {
    transactionFetch(
      `${getConfig().API_HOST}/${
        getConfig().API_BASEPATH
      }/request-payments/postepay/${requestId}`,
      setInfo,
      onError
    );
    transactionPolling(
      `${getConfig().API_HOST}/${
        getConfig().API_BASEPATH
      }/request-payments/postepay/${requestId}`,
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
      !getCurrentLocation().includes("?urlRedirect=")
    ) {
      navigate(getCurrentLocation() + "?urlRedirect=" + info?.urlRedirect!);
    }
    info?.authOutcome && navigate(info?.clientResponseUrl);
  }, [info]);

  const handleClick = React.useCallback(() => {
    navigate(getCurrentLocation() + "?urlRedirect=" + info?.urlRedirect!);
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
    </Box>
  );
}
