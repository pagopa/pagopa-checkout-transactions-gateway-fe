import { LoadingButton } from "@mui/lab";
import { Box, SxProps, Theme, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { PollingResponseEntity } from "../models/transactions";

const layoutStyle: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  textAlign: "center",
  alignItems: "center",
};
export default function Index() {
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [info, setInfo] = React.useState<PollingResponseEntity>();
  const i18nInterpolation = { appName: info?.channel };

  React.useEffect(() => {
    // get api here
    // mocked json
    setInfo({
      channel: "Postepay",
      urlRedirect: "/",
      clientResponseUrl: "",
      logoResourcePath:
        "https://www.poste.it/img/1476453799105/icona-logo-app-postepay.png",
      authOutcome: null,
      error: null,
    });
  }, []);

  const handleClick = React.useCallback(() => {
    setLoading(true);
    // do something
  }, []);

  return (
    <Box sx={layoutStyle} aria-live="polite">
      <img
        src={info?.logoResourcePath}
        alt="Logo gestore"
        style={{ width: "59px", height: "59px" }}
      />
      <Typography variant="h5" component="div" mt={6}>
        {t("index.title", i18nInterpolation)}
      </Typography>
      <Typography variant="body1" component="div" my={2}>
        {t("index.body", i18nInterpolation)}
      </Typography>
      <LoadingButton
        type="button"
        onClick={handleClick}
        loading={loading}
        variant="outlined"
        sx={{
          width: "100%",
          height: "100%",
          minHeight: 45,
        }}
        aria-live="polite"
        aria-label={
          loading ? t("loading") : t("index.submit", i18nInterpolation)
        }
      >
        {loading ? "" : t("index.submit", i18nInterpolation)}
      </LoadingButton>
    </Box>
  );
}
