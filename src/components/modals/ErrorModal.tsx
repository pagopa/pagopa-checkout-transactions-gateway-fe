import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  LinearProgress,
  SxProps,
  Typography,
  useTheme
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

function ErrorModal(props: {
  title: string;
  body: string;
  open: boolean;
  onClose: () => void;
  sx?: SxProps;
  progress?: boolean;
}) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Dialog
      PaperProps={{
        sx: {
          width: 600,
          borderRadius: 1,
          p: 4,
          background: theme.palette.background.default,
          ...props.sx
        }
      }}
      fullWidth
      open={props.open}
      onClose={props.onClose}
      aria-live="assertive"
    >
      <DialogTitle sx={{ p: 0 }}>
        <Typography variant="h6" component={"div"} sx={{ mb: 2 }}>
          {props.title}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Typography variant="body1" component={"div"}>
          {props.body}
        </Typography>
        {props.progress ? (
          <LinearProgress sx={{ my: 2 }} />
        ) : (
          <Button
            variant="contained"
            onClick={props.onClose}
            sx={{
              width: "100%",
              height: "100%",
              minHeight: 45,
              mt: 4
            }}
          >
            {t("close")}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ErrorModal;
