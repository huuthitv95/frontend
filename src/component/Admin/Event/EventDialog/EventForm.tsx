// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Box, Grid2 as Grid, Link, Typography, useMediaQuery, useTheme } from "@mui/material";
import { lazy, Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuditLog } from "../../../../api/dashboard";
import { FileType } from "../../../../api/explorer";
import { useAppDispatch } from "../../../../redux/hooks";
import FacebookCircularProgress from "../../../Common/CircularProgress";
import { NoWrapTypography } from "../../../Common/StyledComponents";
import TimeBadge from "../../../Common/TimeBadge";
import UserAvatar from "../../../Common/User/UserAvatar";
import FileTypeIcon from "../../../FileManager/Explorer/FileTypeIcon";
import SettingForm from "../../../Pages/Setting/SettingForm";
import EntityDialog from "../../Entity/EntityDialog/EntityDialog";
import FileDialog from "../../File/FileDialog/FileDialog";
import { getEventName } from "../../Settings/Event/Events";
import ShareDialog from "../../Share/ShareDialog/ShareDialog";
import UserDialog from "../../User/UserDialog/UserDialog";
const MonacoEditor = lazy(() => import("../../../Viewers/CodeViewer/MonacoEditor"));

const EventForm = ({ values }: { values: AuditLog }) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation("dashboard");
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userDialogID, setUserDialogID] = useState<number>(0);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [fileDialogID, setFileDialogID] = useState<number>(0);
  const [entityDialogOpen, setEntityDialogOpen] = useState(false);
  const [entityDialogID, setEntityDialogID] = useState<number>(0);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareDialogID, setShareDialogID] = useState<number>(0);

  const userClicked = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setUserDialogOpen(true);
    setUserDialogID(values?.edges?.user?.id ?? 0);
  };

  const fileClicked = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setFileDialogOpen(true);
    setFileDialogID(values?.edges?.file?.id ?? 0);
  };

  const entityClicked = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setEntityDialogOpen(true);
    setEntityDialogID(values?.edges?.entity?.id ?? 0);
  };

  const shareClicked = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setShareDialogOpen(true);
    setShareDialogID(values?.edges?.share?.id ?? 0);
  };

  return (
    <>
      <UserDialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} userID={userDialogID} />
      <FileDialog open={fileDialogOpen} onClose={() => setFileDialogOpen(false)} fileID={fileDialogID} />
      <EntityDialog open={entityDialogOpen} onClose={() => setEntityDialogOpen(false)} entityID={entityDialogID} />
      <ShareDialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} shareID={shareDialogID} />
      <Box>
        <Grid container spacing={isMobile ? 2 : 3} alignItems={"stretch"}>
          <SettingForm title={t("file.id")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.id}
            </Typography>
          </SettingForm>
          <SettingForm title={t("event.type")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {t(`settings.event.${getEventName(values.type ?? 0)}`, getEventName(values.type ?? 0))}
            </Typography>
          </SettingForm>
          <SettingForm title={t("event.ip")} noContainer lgWidth={2}>
            <Typography
              variant={"body2"}
              color={"textSecondary"}
              sx={{ wordBreak: "keep-all", overflowWrap: "break-word" }}
            >
              {values.ip ?? "-"}
            </Typography>
          </SettingForm>
          <SettingForm title={t("event.datetime")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              <TimeBadge variant="inherit" datetime={values.created_at ?? ""} timeAgoThreshold={0} />
            </Typography>
          </SettingForm>
          <SettingForm title={t("event.correlationId")} noContainer lgWidth={4}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.correlation_id ?? "-"}
            </Typography>
          </SettingForm>
          <SettingForm title={t("event.linkedUser")} noContainer lgWidth={4}>
            <NoWrapTypography variant={"body2"} color={"textSecondary"}>
              {values?.edges?.user ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <UserAvatar
                    sx={{ width: 24, height: 24 }}
                    overwriteTextSize
                    user={{
                      id: values?.user_hash_id ?? "",
                      nickname: values?.edges?.user?.nick ?? "",
                      created_at: values?.edges?.user?.created_at ?? "",
                    }}
                  />
                  <NoWrapTypography variant="inherit">
                    <Link
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      onClick={userClicked}
                      underline="hover"
                      href="#/"
                    >
                      {values?.edges?.user?.nick}
                    </Link>
                  </NoWrapTypography>
                </Box>
              ) : (
                "-"
              )}
            </NoWrapTypography>
          </SettingForm>
          <SettingForm title={t("event.linkedFile")} noContainer lgWidth={4}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values?.edges?.file ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FileTypeIcon name={values?.edges?.file?.name ?? ""} fileType={FileType.file} />
                  <NoWrapTypography variant="inherit">
                    <Link
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      onClick={fileClicked}
                      underline="hover"
                      href="#/"
                    >
                      {values?.edges?.file?.name}
                    </Link>
                  </NoWrapTypography>
                </Box>
              ) : (
                "-"
              )}
            </Typography>
          </SettingForm>
          <SettingForm title={t("event.linkedEntity")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values?.edges?.entity ? (
                <Link onClick={entityClicked} href={"#/"}>
                  #{values?.edges?.entity?.id}
                </Link>
              ) : (
                "-"
              )}
            </Typography>
          </SettingForm>
          <SettingForm title={t("event.linkedShare")} noContainer lgWidth={2}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values?.edges?.share ? (
                <Link href={"#/"} onClick={shareClicked}>
                  #{values?.edges?.share?.id}
                </Link>
              ) : (
                "-"
              )}
            </Typography>
          </SettingForm>
          <SettingForm title={t("event.userAgent")} noContainer lgWidth={12}>
            <Typography variant={"body2"} color={"textSecondary"}>
              {values.content?.user_agent ?? "-"}
            </Typography>
          </SettingForm>
          <SettingForm title={t("event.rawContent")} noContainer lgWidth={12}>
            <Suspense fallback={<FacebookCircularProgress />}>
              <MonacoEditor
                theme={theme.palette.mode === "dark" ? "vs-dark" : "vs"}
                language="json"
                value={JSON.stringify(values, null, 4)}
                height="400px"
                minHeight="400px"
                options={{
                  wordWrap: "on",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  readOnly: true,
                }}
              />
            </Suspense>
          </SettingForm>
        </Grid>
      </Box>
    </>
  );
};

export default EventForm;
