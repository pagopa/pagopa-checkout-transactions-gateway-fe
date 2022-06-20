import {
  Box,
  Button,
  CircularProgress,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Channel, PollingResponseEntity } from "../models/transactions";

const layoutStyle: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  textAlign: "center",
  alignItems: "center",
};
export default function Index() {
  const { t } = useTranslation();
  const [info, setInfo] = React.useState<PollingResponseEntity>();
  const [loading] = React.useState<boolean>(
    window.location.href.includes("?urlRedirect=")
  );
  const i18nInterpolation = { appName: "Postepay" };
  const i18nTitle = loading ? "index.loadingTitle" : "index.title";
  const i18nBody = loading ? "index.loadingBody" : "index.body";

  React.useEffect(() => {
    if (window.location.href.includes("?urlRedirect=")) {
      const requestId = window.location.href
        .split("?urlRedirect=")[0]!
        .split("/")
        .pop()!;
      const pollingInterval = setInterval(() => {
        fetch(`apiBasePath/request-payments/postepay/${requestId}`)
          .then((resp) => resp.json())
          .then((data: PollingResponseEntity) => {
            if (data.authOutcome) {
              setInfo(data);
            } else {
              clearInterval(pollingInterval);
            }
          })
          .catch(() => {
            setInfo({
              channel: "APP",
              urlRedirect: "test",
              clientResponseUrl: "",
              logoResourcePath:
                "https://www.poste.it/img/1476453799105/icona-logo-app-postepay.png",
              authOutcome: null,
              error: null,
            });
            setTimeout(() => clearInterval(pollingInterval), 10000);
          });
      }, 3000);
    } else {
      const requestId = window.location.href.split("/").pop()!;
      fetch(`apiBasePath/request-payments/postepay/${requestId}`)
        .then((resp) => resp.json())
        .then((data: PollingResponseEntity) => setInfo(data))
        .catch(() =>
          setInfo({
            channel: "APP",
            urlRedirect: "test",
            clientResponseUrl: "",
            logoResourcePath:
              "https://www.poste.it/img/1476453799105/icona-logo-app-postepay.png",
            authOutcome: null,
            error: null,
          })
        );
    }
  }, []);

  React.useEffect(() => {
    if (info?.urlRedirect && info.channel === Channel.WEB) {
      window.location.assign(info.urlRedirect);
    }
    if (
      info?.urlRedirect &&
      info.channel === Channel.APP &&
      !window.location.href.includes("?urlRedirect=")
    ) {
      window.location.assign(
        window.location.href + "?urlRedirect=" + info?.urlRedirect!
      );
    }
  }, [info]);

  const handleClick = React.useCallback(() => {
    window.location.assign(
      window.location.href + "?urlRedirect=" + info?.urlRedirect!
    );
  }, [info]);

  return (
    <Box sx={layoutStyle} aria-live="polite">
      {info ? (
        <>
          {loading ? (
            <CircularProgress />
          ) : (
            <img
              src={info?.logoResourcePath}
              alt="Logo gestore"
              style={{ width: "59px", height: "59px" }}
            />
          )}
          <Typography variant="h5" component="div" mt={6}>
            {t(i18nTitle, i18nInterpolation)}
          </Typography>
          <Typography variant="body1" component="div" my={2}>
            {t(i18nBody, i18nInterpolation)}
          </Typography>
          {!loading && (
            <Button
              type="button"
              onClick={handleClick}
              variant="outlined"
              sx={{
                width: "100%",
                height: "100%",
                minHeight: 45,
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
