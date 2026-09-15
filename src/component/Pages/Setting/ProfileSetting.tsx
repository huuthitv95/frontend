// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Collapse,
  Grid2,
  List,
  Link as MuiLink,
  Stack,
  styled,
  SvgIconProps,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { bindPopover, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { enqueueSnackbar } from "notistack";
import { useMemo, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { sendUnlinkOpenID, sendUpdateUserSetting } from "../../../api/api.ts";
import { OpenID, OpenIDProvider, ShareLinksInProfileLevel, UserSettings } from "../../../api/user.ts";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import { confirmOperation } from "../../../redux/thunks/dialog.ts";
import SessionManager from "../../../session";
import CustomIcon from "../../Common/CustomIcon.tsx";
import { DefaultCloseAction } from "../../Common/Snackbar/snackbar.tsx";
import { DefaultButton, DenseFilledTextField } from "../../Common/StyledComponents.tsx";
import TimeBadge from "../../Common/TimeBadge.tsx";
import BranchCompare from "../../Icons/BranchCompare.tsx";
import CaretDown from "../../Icons/CaretDown.tsx";
import Dismiss from "../../Icons/Dismiss.tsx";
import Link from "../../Icons/Link.tsx";
import QQ from "../../Icons/QQ.tsx";
import { OpenIDButton } from "../Login/Signin/OpenIDButton.tsx";
import AvatarSetting from "./AvatarSetting.tsx";
import ProfileSettingPopover, { useProfileSettingSummary } from "./ProfileSettingPopover.tsx";
import SettingForm from "./SettingForm.tsx";
import SettingListItem from "./SettingListItem.tsx";

export interface ProfileSettingProps {
  setting: UserSettings;
  setSetting: (setting: UserSettings) => void;
}

const ProfileDropButton = styled(DefaultButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  minWidth: 0,
  minHeight: 0,
  fontSize: theme.typography.body2.fontSize,
  fontWeight: theme.typography.body2.fontWeight,
  borderRadius: "4px",
  padding: "0px 4px",
  position: "relative",
  left: "-4px",
}));

const UnlinkButton = ({
  provider,
  onUnlinked,
}: {
  provider: OpenIDProvider;
  onUnlinked: (provider: OpenIDProvider) => void;
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const onClick = () => {
    dispatch(confirmOperation(t("setting.unlinkConfirm"))).then(() => {
      setLoading(true);
      dispatch(sendUnlinkOpenID(provider))
        .then(() => {
          onUnlinked(provider);
        })
        .finally(() => {
          setLoading(false);
        });
    });
  };
  return (
    <LoadingButton loading={loading} variant={"outlined"} onClick={onClick} startIcon={<Dismiss />} color={"error"}>
      <span>{t("vas.unlink")}</span>
    </LoadingButton>
  );
};

const Connector = ({
  color,
  openid,
  icon,
  title,
  provider,
  onUnlinked,
}: {
  openid?: OpenID;
  provider: OpenIDProvider;
  color?: string;
  icon: (props: SvgIconProps) => JSX.Element;
  onUnlinked: (provider: OpenIDProvider) => void;
  title: string;
}) => {
  const { t } = useTranslation();

  return (
    <SettingListItem
      iconColor={color}
      icon={icon}
      settingTitle={t(title)}
      sx={{
        pr: "150px",
      }}
      settingAction={
        openid ? (
          <UnlinkButton onUnlinked={onUnlinked} provider={provider} />
        ) : (
          <OpenIDButton linking provider={provider} icon={<Link />} contentOverride={t("vas.connect")} />
        )
      }
      settingDescription={
        openid ? (
          <Trans
            i18nKey={"setting.linkedAt"}
            ns={"application"}
            components={[<TimeBadge datetime={openid.linked_at} variant={"inherit"} />]}
          />
        ) : (
          t("setting.notLinked")
        )
      }
    />
  );
};

const ProfileSetting = ({ setting, setSetting }: ProfileSettingProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const nickRef = useRef<HTMLInputElement>(null);

  const user = SessionManager.currentLoginOrNull();
  const [nick, setNick] = useState(user?.user.nickname);
  const [nickLoading, setNickLoading] = useState(false);
  const [unsubscribeLoading, setUnsubscribeLoading] = useState(false);
  const [profileSettingLoading, setProfileSettingLoading] = useState(false);
  const { sso_enabled, qq_enabled, sso_display_name, oidc_enabled, oidc_display_name, sso_icon, oidc_icon } =
    useAppSelector((state) => state.siteConfig.login.config);

  const profileSettingPopup = usePopupState({
    variant: "popover",
    popupId: "profileSetting",
  });

  const profileSettingSummary = useProfileSettingSummary(setting.share_links_in_profile);

  const onClick = () => {
    // Validate input length
    if (nickRef.current && nickRef.current.checkValidity()) {
      setNickLoading(true);
      dispatch(sendUpdateUserSetting({ nick }))
        .then(() => {
          if (user?.user) {
            SessionManager.updateUserIfExist({
              ...user?.user,
              nickname: nick ?? "",
            });
          }
        })
        .finally(() => {
          setNickLoading(false);
        });
    } else {
      // Input is invalid, show validation errors
      nickRef.current?.reportValidity();
    }
  };

  const onUnsubscribe = () => {
    dispatch(confirmOperation(t("vas.cancelSubscriptionWarning"))).then(() => {
      setUnsubscribeLoading(true);
      dispatch(
        sendUpdateUserSetting({
          group_expires: true,
        }),
      )
        .then(() => {
          setSetting({
            ...setting,
            group_expires: undefined,
          });
          enqueueSnackbar({
            variant: "success",
            message: t("vas.cancelSubscription"),
            action: DefaultCloseAction,
          });
        })
        .finally(() => {
          setUnsubscribeLoading(false);
        });
    });
  };

  const { ssoOpenId, qqOpenId, oidcOpenId } = useMemo(() => {
    const ssoOpenId = setting.open_id?.find((x) => x.provider == OpenIDProvider.logto);
    const qqOpenId = setting.open_id?.find((x) => x.provider == OpenIDProvider.qq);
    const oidcOpenId = setting.open_id?.find((x) => x.provider == OpenIDProvider.oidc);
    return { ssoOpenId, qqOpenId, oidcOpenId };
  }, [setting]);

  const connectorEnabled = sso_enabled || qq_enabled || oidc_enabled;

  const onUnlinked = (provider: OpenIDProvider) => {
    setSetting({
      ...setting,
      open_id: setting.open_id?.filter((x) => x.provider != provider),
    });
  };

  const onProfileSettingChange = (value: ShareLinksInProfileLevel) => {
    setProfileSettingLoading(true);
    dispatch(sendUpdateUserSetting({ share_links_in_profile: value }))
      .then(() => {
        setSetting({
          ...setting,
          share_links_in_profile: value,
        });
        profileSettingPopup.close();
      })
      .finally(() => {
        setProfileSettingLoading(false);
      });
  };

  const CustomIconWrapper = (icon: string): ((props: SvgIconProps) => JSX.Element) => {
    return (props: SvgIconProps) => {
      return <CustomIcon icon={icon} {...props} />;
    };
  };

  return (
    <Stack spacing={3}>
      <Grid2
        container
        spacing={isMobile ? 3 : 4}
        direction={isMobile ? "column" : "row-reverse"}
        sx={{ width: "100%" }}
      >
        <Grid2 spacing={3} sx={{ flexGrow: 1, width: "100%" }} size={{ md: 6, xs: 12 }}>
          {user && <AvatarSetting user={user?.user} />}
        </Grid2>
        <Grid2 spacing={3} sx={{ flexGrow: 1, width: "100%" }} size={{ md: 6, xs: 12 }}>
          <Stack spacing={3}>
            <SettingForm title={t("login.email")} noContainer lgWidth={12}>
              <DenseFilledTextField disabled fullWidth value={user?.user.email} />
            </SettingForm>
            <SettingForm title={t("setting.nickname")} noContainer lgWidth={12}>
              <DenseFilledTextField
                fullWidth
                onChange={(e) => setNick(e.target.value)}
                value={nick}
                required
                inputProps={{ maxLength: 255 }}
                helperText={t("setting.nickNameDes")}
                inputRef={nickRef}
              />
              <Collapse in={nick != user?.user.nickname}>
                <LoadingButton variant={"contained"} onClick={onClick} loading={nickLoading} sx={{ mt: 1 }}>
                  <span>{t("fileManager.save")}</span>
                </LoadingButton>
              </Collapse>
            </SettingForm>
            <Grid2 spacing={isMobile ? 3 : 4} container sx={{ width: "100%" }}>
              <SettingForm title={t("setting.uid")} noContainer lgWidth={6}>
                <Typography variant={"body2"} color={"textSecondary"}>
                  {user?.user.id}
                </Typography>
              </SettingForm>
              <SettingForm title={t("setting.regTime")} noContainer lgWidth={6}>
                <Typography variant={"body2"} color={"textSecondary"}>
                  <TimeBadge datetime={user?.user.created_at} variant={"inherit"} />
                </Typography>
              </SettingForm>
            </Grid2>
            <Grid2 spacing={isMobile ? 3 : 4} container sx={{ width: "100%" }}>
              <SettingForm title={t("setting.group")} noContainer lgWidth={6}>
                <Typography variant={"body2"} color={"textSecondary"}>
                  {user?.user.group?.name}
                  {setting.group_expires && (
                    <>
                      <Box component={"span"} sx={{ ml: 1 }}>
                        <Trans
                          i18nKey={"vas.groupExpire"}
                          components={[<TimeBadge datetime={setting.group_expires} variant={"inherit"} />]}
                        />
                      </Box>
                      <Box>
                        <MuiLink onClick={onUnsubscribe} href={"#"} underline={"hover"}>
                          {t("vas.manuallyCancelSubscription")}
                        </MuiLink>
                      </Box>
                    </>
                  )}
                </Typography>
              </SettingForm>

              <SettingForm title={t("setting.profilePage")} noContainer lgWidth={6}>
                <ProfileDropButton
                  size={"small"}
                  {...bindTrigger(profileSettingPopup)}
                  endIcon={<CaretDown sx={{ fontSize: "12px!important" }} />}
                  disabled={profileSettingLoading}
                >
                  {profileSettingSummary}
                </ProfileDropButton>
                <ProfileSettingPopover
                  currentValue={setting.share_links_in_profile}
                  onValueChange={onProfileSettingChange}
                  {...bindPopover(profileSettingPopup)}
                />
              </SettingForm>
            </Grid2>
          </Stack>
        </Grid2>
      </Grid2>
      {connectorEnabled && (
        <SettingForm title={t("setting.accountLinking")}>
          <List disablePadding>
            {sso_enabled && (
              <Connector
                onUnlinked={onUnlinked}
                color={theme.palette.primary.main}
                openid={ssoOpenId}
                provider={OpenIDProvider.logto}
                icon={sso_icon ? CustomIconWrapper(sso_icon) : BranchCompare}
                title={oidc_display_name ?? "vas.sso"}
              />
            )}
            {qq_enabled && (
              <Connector
                onUnlinked={onUnlinked}
                provider={OpenIDProvider.qq}
                color={theme.palette.error.main}
                openid={qqOpenId}
                icon={QQ}
                title={"vas.qq"}
              />
            )}
            {oidc_enabled && (
              <Connector
                onUnlinked={onUnlinked}
                provider={OpenIDProvider.oidc}
                color={theme.palette.primary.main}
                openid={oidcOpenId}
                icon={oidc_icon ? CustomIconWrapper(oidc_icon) : BranchCompare}
                title={oidc_display_name ?? "vas.sso"}
              />
            )}
          </List>
        </SettingForm>
      )}
    </Stack>
  );
};

export default ProfileSetting;
