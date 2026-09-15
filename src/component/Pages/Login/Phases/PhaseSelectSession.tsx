// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from "react";
import SessionManager, { Session } from "../../../../session";
import {
  Avatar,
  Box,
  Grow,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Tooltip,
} from "@mui/material";
import Add from "../../../Icons/Add.tsx";
import { useAppDispatch } from "../../../../redux/hooks.ts";
import { refreshUserSession } from "../../../../redux/thunks/session.ts";
import Delete from "../../../Icons/Delete.tsx";
import { TransitionGroup } from "react-transition-group";
import UserAvatar from "../../../Common/User/UserAvatar.tsx";
import { User } from "../../../../api/user.ts";
import { SquareChip } from "../../../Common/StyledComponents.tsx";

export interface SessionSelectionProps {
  switchSession: (session: Session) => void;
  loginWithHint?: (hint: string) => void;
  onAllSessionRemoved: () => void;
  onLoginWithOtherAccount: () => void;
  current?: User;
  variant?: "popover" | "list";
}

export const SessionSelection = (props: SessionSelectionProps) => {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<Session[]>(SessionManager.validSession());
  useEffect(() => {
    setSessions(SessionManager.validSession());
  }, []);

  const removeSession = useCallback(
    (session: Session) => {
      SessionManager.removeSession(session.user.id);
      const newSessions = SessionManager.validSession();
      setSessions(newSessions);
      if (newSessions.length === 0) {
        props.onAllSessionRemoved();
      }
    },
    [setSessions, props.onAllSessionRemoved],
  );

  const isList = props.variant == "list";
  const iconMinWidth = isList ? 46 : 56;

  return (
    <List sx={{ width: "100%" }} dense={isList}>
      <TransitionGroup>
        {sessions
          .filter((s) => (props.current ? s.user.id != props.current.id : true))
          .map((session) => (
            <Grow key={session.user.id}>
              <ListItem
                secondaryAction={
                  <Tooltip title={t("login.logout")}>
                    <IconButton
                      onClick={() => removeSession(session)}
                      edge="end"
                      size={isList ? "small" : undefined}
                      aria-label="delete"
                    >
                      <Delete fontSize={isList ? "small" : undefined} />
                    </IconButton>
                  </Tooltip>
                }
                disablePadding
              >
                <ListItemButton
                  onClick={() =>
                    session.signedOut ? props.loginWithHint(session.user.email) : props.switchSession(session)
                  }
                >
                  <ListItemAvatar sx={{ minWidth: iconMinWidth }}>
                    <UserAvatar sx={isList ? { width: 30, height: 30 } : undefined} user={session.user} />
                  </ListItemAvatar>
                  <ListItemText
                    sx={{ ...(isList ? { my: 0 } : {}) }}
                    primary={
                      <Box>
                        {session.user.nickname}
                        {session.signedOut && (
                          <SquareChip
                            sx={{
                              ml: 1,
                              height: "initial",
                              fontSize: (theme) => (isList ? theme.typography.caption.fontSize : undefined),
                            }}
                            size={"small"}
                            label={t("navbar.notLoginIn")}
                          />
                        )}
                      </Box>
                    }
                    secondary={session.user.email}
                    slotProps={{
                      primary: {
                        variant: isList ? "body2" : undefined,
                      },

                      secondary: {
                        sx: { wordBreak: "break-all" },
                        variant: isList ? "caption" : "body2",
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </Grow>
          ))}
      </TransitionGroup>
      <ListItem disablePadding>
        <ListItemButton onClick={props.onLoginWithOtherAccount}>
          <ListItemAvatar
            sx={{
              minWidth: iconMinWidth,
            }}
          >
            <Avatar
              sx={{
                bgcolor: (theme) => theme.palette.action.active,
                ...(isList ? { width: 30, height: 30 } : {}),
              }}
            >
              <Add fontSize={isList ? "small" : undefined} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            sx={{ ...(isList ? { my: 1 } : {}) }}
            primary={t("login.useOtherAccount")}
            slotProps={{
              primary: {
                variant: isList ? "body2" : undefined,
              },
            }}
          />
        </ListItemButton>
      </ListItem>
    </List>
  );
};

export interface Phase2FAProps {
  onLoginWithOtherAccount: (email?: string) => void;
  redirect: string | null | undefined;
  onSessionSwitch?: (session: Session) => void;
}

const PhaseSelectSession = ({ onLoginWithOtherAccount, redirect, onSessionSwitch }: Phase2FAProps) => {
  const dispatch = useAppDispatch();
  const switchSession = useCallback(
    (session: Session) => {
      if (onSessionSwitch) {
        onSessionSwitch(session);
      } else {
        dispatch(refreshUserSession(session, redirect ?? null));
      }
    },
    [dispatch, redirect, onSessionSwitch],
  );

  return (
    <SessionSelection
      switchSession={switchSession}
      onAllSessionRemoved={onLoginWithOtherAccount}
      loginWithHint={onLoginWithOtherAccount}
      onLoginWithOtherAccount={() => onLoginWithOtherAccount()}
    />
  );
};

export default PhaseSelectSession;
